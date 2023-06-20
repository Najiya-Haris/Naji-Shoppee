const { model } = require("mongoose");
const Product  = require('../Models/productModel');
const User  = require('../Models/userModel');
const Category = require('../Models/categoryModel');
const fs = require('fs');
const path = require('path')


//------------ productlist view section
const loadProductlist = async(req,res)=>{
    try{

        const categoryData = await Category.find({})
        const adminData = await User.findById({ _id: req.session.Auser_id})
        const productData = await Product.find({is_delete:false});
        res.render('productList',{admin:adminData,activePage: 'productList',category:categoryData,product:productData});
    }catch(error){
        console.log(error.message);
    }
}


//------------- product data storing section
const insertProduct = async (req, res) => {
    try {
        const images = [];
        if (req.files && req.files.length > 0) {
           for (let i = 0; i < req.files.length; i++) {
            images.push(req.files[i].filename);
          }
        }
        const productName = req.body.productName.trim();
        const stockQuantity = req.body.stockQuantity.trim();
        const price = req.body.price.trim();
        if(productName && stockQuantity && price){
        const product = new Product({
            productName: productName,
            brand: req.body.brand,
            size: req.body.size,
            category: req.body.category,
            description: req.body.description,
            stockQuantity: stockQuantity,
            image: images,
            price: price,
        });
        const productData = await product.save(); 

        if (productData) {
            return res.redirect("/admin/productList");
        } else {
            return res.redirect("/admin/productList");
        }
      }else{
        return res.redirect("/admin/productList");
      }
    } catch (error) {
        console.log(error.message);
    }
};


// ------------ Delete product section
const deleteProduct = async (req,res)=> {
  try{
    const id = req.query.id; 
    const product =   await Product.updateOne({ _id: id }, { $set: { is_delete: true } });
    res.redirect('/admin/productList');

  }catch(error){
    console.log(error.message);
  }
}



const productDetails = async(req,res) => {
    let productId = req.query.id;
    const session = req.session.user_id;

    try {
      const product = await Product.findById(productId);
      
      res.render('singleProduct',{product,session})

    } catch (error) {
      
    }
}

//  ------------- Edit product  section
const editproduct = async(req,res) => {
  
  try {
   
    const id = req.params.id
    const productData = await Product.findOne({_id:id}).populate('category')

    const categoryData = await Category.find({is_delete:false})
   
    const adminData = await User.findById({_id:req.session.Auser_id})
     res.render('editProductList',{admin:adminData,activePage: 'productList',category:categoryData,product:productData})
  } catch (error) {
      console.log(error.message);
  }
}


//  ------------- Update product  section
const updateProduct = async (req,res) =>{
if(req.body.productName.trim() === "" || req.body.category.trim() === "" || req.body.description.trim() === "" || req.body.StockQuantity.trim() === "" || req.body.price.trim() === "") {
    const id = req.params.id
    const productData = await Product.findOne({_id:id}).populate('category')
    const categoryData = Category.find()
    const adminData = await User.findById({_id:req.session.Auser_id})
    res.render('editProductList',{admin:adminData,product: productData, message:"All fields required",category:categoryData})
}else{
    try {
        const arrayimg = []
        for(file of req.files){
            arrayimg.push(file.filename)
        } 
        const id = req.params.id
       await Product.updateOne({_id:id},{$set:{
            productName:req.body.productName,
            category:req.body.category,
            stockQuantity:req.body.StockQuantity,
            price:req.body.price,
            description:req.body.description,
            brand:req.body.brand
        }})
        res.redirect('/admin/productList')
    } catch (error) {
        console.log(error.message);
    }
}
}


//  ------------- Delete image section
const deleteimage = async(req,res)=>{
try{
  const imgid = req.params.imgid;
  const prodid = req.params.prodid;
  fs.unlink(path.join(__dirname,"../public/adminAssets/adminImages",imgid),()=>{})
  const productimg  = await  Product.updateOne({_id:prodid},{$pull:{image:imgid}})
  res.redirect('/admin/editProductList/'+prodid)
}catch(error){
  console.log(error.message)
}
}


//  ------------- Update image section
const updateimage = async (req, res) => {
try {
  const id = req.params.id
  
  const prodata = await Product.findOne({ _id: id })
  console.log(prodata + 'is working')
  const imglength = prodata.image.length

  if (imglength <= 10) {
    let images = []
    for (file of req.files) {
      images.push(file.filename)
    }

    if (imglength + images.length <= 10) {

      const updatedata = await Product.updateOne({ _id: id }, { $addToSet: { image: { $each: images } } })

      res.redirect("/admin/editProductList/" + id)
    } else {
      const productData = await Product.findOne({ _id: id }).populate('category')
      const adminData = await User.findById({_id:req.session.Auser_id})
      const categoryData = await Category.find()
      res.render('editProductList', { admin:adminData,product: productData, category: categoryData , imgfull: true})
    }
  } else {
    res.redirect("/admin/editProductList/")
  }
} catch (error) {
  console.log(error.message);
}
}
    
module.exports = {
    loadProductlist,
    insertProduct,
    deleteProduct,
    productDetails,
    editproduct,
    updateProduct,
    deleteimage,
    updateimage

}