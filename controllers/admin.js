// const mongodb = require('mongodb');
const mongoose = require('mongoose')
const fileHelf = require('../util/file');
const Product = require('../models/product');
const { validationResult } = require('express-validator');
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError:false,
        errorMessage:null,
        validationErrors:[]
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const discount=req.body.discount;
    const Price = req.body.Price;
    const description = req.body.description;
    const freedelivery=req.body.freedelivery;
    const errors = validationResult(req);

    if(!image){
        return   res.status(422).render('admin/edit-product',{
               path:'/admin/add-product',
               pageTitle:'Add-Product',
               editing:false,
               hasError:true,
               product:{
                   title:title,
                   discount:discount,
                   Price:Price,
                   description:description,
                   freedelivery:freedelivery
               },
               errorMessage:'image file url not match',
               validationErrors:[]
           });
       }

    if(!errors.isEmpty()){
     return   res.status(422).render('admin/edit-product',{
            path:'/admin/add-product',
            pageTitle:'Add-Product',
            editing:false,
            hasError:true,
            product:{
                title:title,
                ImageURL:ImageURL,
                discount:discount,
                Price:Price,
                description:description,
                freedelivery:freedelivery
            },
            errorMessage:errors.array()[0].msg,
            validationErrors:errors.array()
        })
    }
    const ImageURL = image.path;
    console.log(image.path)
   const product= new Product({
    // _id: new mongoose.Types.ObjectId('648af9914380f2129b9be99c'),
    title:title,
    ImageURL:ImageURL,
    Price:Price,
    discount:discount,
    description:description,
    freedelivery:freedelivery,
    userId: req.user
});
   product
   .save()
   .then(result => {
    // console.log(result);
    console.log("Created Product");
    res.redirect('/admin/products');
})
.catch(err => { 
   const error = new Error('err')
   error.httpStatusCode = 500
   return next(error)
});
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
   Product.findById(prodId)
    .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError:false,
                errorMessage:null,
                validationErrors:[]
           
             })
         })
    .catch(err=>{
        const error = new Error('err')
    error.httpStatusCode = 500
    return next(error)
});
};


exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedDiscount=req.body.discount;
    const updatedPrice = req.body.Price;
    const updatedDesc = req.body.description;
    const updatedFree=req.body.freedelivery;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status(422).render('admin/edit-product',{
            path:'/admin/edit-product',
            pageTitle:'Edit Product',
            editing: true,
            hasError:true,
            product:{
                title: updatedTitle,
                discount:updatedDiscount,
                Price:updatedPrice,
                description:updatedDesc,
                freedelivery:updatedFree,
                _id: prodId
            },
            errorMessage:errors.array()[0].msg,
            validationErrors:errors.array()
            
        })
    }
   Product.findById(prodId)
   .then(product => {
    if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
        product.title = updatedTitle;
        product.discount = updatedDiscount;
        product.Price = updatedPrice;
        product.description = updatedDesc;
        product.freedelivery = updatedFree;
        if(image){
            fileHelf.deletFile(product.ImageURL)
            product.ImageURL = image.path;
        }
        return product.save()
        .then(result=>{
            console.log('updated product')
            res.redirect('/admin/products');
        })
    })
    .catch(err =>{
        console.log(err)
//         const error = new Error('err')
//    error.httpStatusCode = 500
//    return next(error)
    });
}

exports.getProducts = (req, res, next) => {
   Product.find({userId: req.user._id})
   .then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
            isAuthenticated: req.session.isLoggedIn
        });

}).catch(err=>{
    const error = new Error('err')
   error.httpStatusCode = 500
   return next(error)
});
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
            if(!product){
                return next(new Error('product not found '))
            }
                
    fileHelf.deletFile(product.ImageURL)
   return Product.deleteOne({_id:prodId ,userId:req.user._id})
    })
    .then(()=>{
        console.log('DESTROY PRODUCT')
        res.redirect('/admin/products');
    })
    .catch(err=>{ console.log(err)

//         const error = new Error('err')
//    error.httpStatusCode = 500
//    return next(error)
    });
  

}