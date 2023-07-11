const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    stockQuantity: {
        type: Number,
        required: true,
    },
    image: {
        type: Array,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    is_delete:{
        type:Boolean,
        default:false,
    },
    percentage:{
        type:Number,
    },
    discountPercentage:{
        type:Number,
    },
    discountName:{
        type:String,
    },
    product_review:[{
        user_name:{
            type:String,
            required:true
        },
        review:{
            type:String,
            required: true
        },
        star:{
            type:Number
        }
    }]
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;