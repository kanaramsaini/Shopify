const express = require('express');
const {check,body} = require('express-validator')
const authController = require('../controllers/auth');
const User = require('../models/user');
const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
router.post('/reset', authController.postReset)
router.post('/login',
[
body('email')
.isEmail()
.withMessage('Enter a valid email address... ')
.normalizeEmail(),

body('password','password has to be valid')
.isLength({min:4}).isAlphanumeric().trim()

], authController.postLogin);
router.post('/signup',
 check('email')
 .isEmail()
 .withMessage('please enter valid email')
 .custom((value ,{req})=>{
   return User.findOne({email:value})
    .then(userDoc=>{
        if(userDoc){
            return Promise.reject('E-mail  exists alredy please different email')
        }
    })
 }).normalizeEmail(),
 body('password','Please Enter A Strong Password')
 .isLength({min:4}).isAlphanumeric().trim(),
 body('confirmPassword').isAlphanumeric().trim()
 .custom((value,{req})=>{
    if(value !== req.body.password){
        throw Error('Confirm Password not match')
    }
    return true
 }),
 authController.postSignup)
router.post('/logout', authController.postLogout);

module.exports= router;