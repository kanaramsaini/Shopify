const path = require('path');

const express = require('express');
const {body} = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// // /admin/add-product => GET
 router.get('/add-product', isAuth, adminController.getAddProduct);

 router.get('/products', isAuth, adminController.getProducts);

// // // /admin/add-product => POST
 router.post('/add-product',[
    body('title').isString().isLength({min:3}),
    body('Price').isFloat(),
    body('discount').isFloat(),
    body('description').isLength({min:6 , max:300}),
    body('freedelivery').isLength({min:1, max:15})
 ],isAuth, adminController.postAddProduct);

  router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)

 router.post('/edit-product',[
   body('title').isString().isLength({min:3}),
   body('Price').isFloat(),
   body('discount').isFloat(),
   body('description').isLength({min:6 , max:300}),
   body('freedelivery').isLength({min:1, max:15})
], isAuth, adminController.postEditProduct);

 router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
