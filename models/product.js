const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title:{
    type:String,
    required:true
  },
  ImageURL:{
    type:String,
    required:true
  },
  Price:{
    type:Number,
    required:true
  },
  discount:{
    type:Number,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  freedelivery:{
    type:String,
    required:true
  },
  userId:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:true
  }
});

module.exports = mongoose.model('Product',productSchema);
