const crypto = require('crypto')
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const {validationResult} = require('express-validator');
const User = require('../models/user');


const transport = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:  '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'
    }
}))
const bcrypt = require('bcryptjs');
const { now } = require('mongoose');
const user = require('../models/user');


exports.getLogin = (req,res,next) =>{
    console.log(req.session.isLoggedIn);
    let messageError = req.flash('error');
    if(messageError.length > 0){
        messageError = messageError[0];
    }else{
        messageError = null;
    }
    console.log(messageError)
    res.render('auth/login',{
        path:'/login',
        pageTitle:'login',
        errorMessage: messageError,
        oldDataInput:{
            email:'',
            password:''
        },
        validationErrors:[]
       
    })
}

exports.getSignup = (req,res,next) =>{
    let messageError = req.flash('error');
    if(messageError.length > 0){
        messageError = messageError[0];
    }else{
        messageError = null;
    }
   res.render('auth/signup',{
        path:'/signup',
        pageTitle:'Signup',
        errorMessage: messageError,
        oldDataInput:{
            email:'',
            password:'',
            confirmPassword:''
        },
        validationErrors:[]
       
    })
}
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return  res.status(422).render('auth/login',{
            path:'/login',
            pageTitle:'Login',
            errorMessage:'invalid email & password',
            oldDataInput:{
                email:email,
                password:password
            },
            validationErrors:errors.array()

        })
    }

    User.findOne({ email: email })
        .then(user => {
            if(!user){
               return res.status(422).render('auth/login',{
                                path:'/login',
                                pageTitle:'Login',
                                errorMessage:'invalid email & password',
                                oldDataInput:{
                                    email:email,
                                    password:password
                                },
                                validationErrors:errors.array()
               })
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('auth/login',{
                        path:'/login',
                        pageTitle:'Login',
                        errorMessage:'invalid email & password',
                        oldDataInput:{
                            email:email,
                            password:password
                        },
                        validationErrors:errors.array()
       })
                })

           
        })
        .catch(err => {
            const error = new Error('err')
   error.httpStatusCode = 500
   return next(error)
        });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
       return res.status(422).render('auth/signup',{
            path:'/signup',
            pageTitle:'Signup',
            errorMessage:errors.array()[0].msg,
            oldDataInput:{
                email:email,
                password:password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        })   
    }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                    email: email,
                    password: hashedPassword,
                    cart: { items: [] }
                    });
            return user.save();
        }).then(result => {
        res.redirect('/login');

        return transport.sendMail({
            to: email,
            from: 'hell@aeeron.in',
            subject:'Signup Succsess..',
            html:'<h1>you successfully signup !!!'
        })
    }).catch(err =>{
        const error = new Error('err')
   error.httpStatusCode = 500
   return next(error)
    })
 };
exports.postLogout = (req,res,next)=>{
    req.session.destroy(erro=>{
        res.redirect('/')
    })
}

exports.getReset =(req,res,next)=>{
        let message = req.flash('error');
        if(message.length > 0){
            message = message[0];
        }else{
            message = null;
        }
        res.render('auth/reset',{
            path:'/reset',
            pageTitle:'reset',
            errorMessage:message
        })
}

exports.postReset = (req,res,next)=>{
    crypto.randomBytes(32,(error,buffer)=>{
        if(error){
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');

        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                req.flash('error', 'email not match')
                return res.redirect('/reset')
            }
           user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            user.save();
        }).then(result=>{
            transport.sendMail({
                to: req.body.email,
                from:'hello@aeeron.in',
                subject:'reset Password',
                html:`
                <p>you requesets reset password</p>
                <p>click this <a href="http://localhost:5000/reset/${token}">link</a> to set a new password </p> 
                `
            })
        })
        .catch(err=>{
            const error = new Error('err')
   error.httpStatusCode = 500
   return next(error)
        })
    })
}

exports.getNewPassword = (req,res,next)=>{
    const token = req.params.token;
    User.findOne({resetToken:token, resetTokenExpiration:{$gt:Date.now()}})
    .then(user=>{
        let message = req.flash('error');
        if(message.length > 0){
            message = message[0]
        }else{
            message = null;
        }
        res.render('auth/new-password',{
            path:'/new-password',
            pageTitle:'new password',
            errorMessage:message,
            userId: user._id.toString(),
            passwordToken: token
        })
    }).catch(err=>{
        const error = new Error('err')
   error.httpStatusCode = 500
   return next(error)
    })
}

exports.postNewPassword = (req,res,next)=>{
    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    const userId = req.body.userId;
   let resetUser;

    User.findOne({
        resetToken:passwordToken,
        resetTokenExpiration:{$gt:Date.now()},
        _id:userId
}).then(user=>{
        resetUser = user;
        return bcrypt.hash(newPassword, 12)
    }).then(hashedPassword=>{
       resetUser.password = hashedPassword
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save()
    }).then(result=>{
        res.redirect('/login')
    })
    .catch(err =>{
        const error = new Error('err')
   error.httpStatusCode = 500
   return next(error)
    })
}