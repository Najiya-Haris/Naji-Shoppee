const User=require('../Models/userModel')
const bcrypt=require('bcrypt')
const session=require('express-session')
const Banner=require('../Models/bannerModel')
const Order=require('../Models/orderModel')
const Product=require('../Models/productModel')

const couponController = require('../controllers/couponController')


let message

const loadLogin= async(req,res)=>{
    try{
        res.render('login',{message})
      
    }catch(err){
        console.log(err.message);
    }
}

const verifyLogin= async(req,res)=>{
    try{
      
        const email=req.body.email
        const password=req.body.password
        
        const userData=await User.findOne({email:email})

        if(userData){
           
            const passwordMatch=await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_admin===0){
                    return res.render('login',{message:'Email and password incorrect'})
                }else{
                    req.session.Auser_id=userData._id
                    res.redirect('/admin/dashboard')
                }
            }else{
                res.render('login',{message:'Email or password is incorrect'})
          
            }
        }else{
            res.render('login',{message:'Email and password incorrect'})
        }


    }catch(err){
        console.log(err.message);
    }
}


//loading sales report page 

const loadSalesReport = async(req,res) =>{
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
   const order = await Order.aggregate([
  { $unwind: "$products" },
  { $match: { 'products.status': 'Delivered' } },
  { $sort: { date: -1 } },
  {
    $lookup: {
      from: 'products',
      let: { productId: { $toObjectId: '$products.productid' } },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
      ],
      as: 'products.productDetails'
    }
  },
  {
    $addFields: {
      'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
    }
  }
]);
    res.render("sales-report", { order ,admin:adminData });
  } catch (error) {
    console.log(error.message);
  }
}


const loadDashboard = async (req, res) => {
    try {
     
     const adminData = await User.findById({ _id: req.session.Auser_id });
 
     const  userData = await User.find({is_block:false  })
   
     const orderData = await Order.find();
 
     const productData = await Product.find({is_delete:false});
    

      //find total delivered sale

    const result = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$products.totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1
        }
      }
    ]);
    
       
    let total = 0
    if (result.length > 0) {
      const total = result[0].total;
    } 
  
    


    //total cod sale

    const codResult = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered', paymentMethod: 'COD' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$products.totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1
        }
      }
    ]);
    
    let codTotal = 0
    if (codResult.length > 0) {
      codTotal = codResult[0].total;
    } 
  

    //total online payment and wallet
    const onlineResult = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered', 'paymentMethod': { $ne: 'COD' } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$products.totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1
        }
      }
    ]);
    
    let onlineTotal = 0;
    if (onlineResult.length > 0) {
      onlineTotal = onlineResult[0].total;
    }
    


      res.render('dashboard',{admin: adminData,order:orderData,product:productData,user:userData,total,codTotal,onlineTotal});
    } catch (error) {
      console.log(error.message);
    }
  };
  


  const newUserLoad= async(req,res)=>{
    try{
        const adminData =await User.findById({_id: req.session.Auser_id})
        const userData=await User.find({is_admin:0})
        res.render('userList',{users:userData,activePage: 'userList',admin:adminData})
    }catch(err){
        console.log(err.message);
    }
  }


  const adminLogout=async(req,res)=>{
try{
    req.session.destroy();
    res.redirect('/admin')
}catch(error){
    console.log(error.message);
}
  }


  const block=async(req,res)=>{
    try{
        const userData=await User.findByIdAndUpdate(req.query.id,{$set:{is_block:true}});
        res.redirect('/admin/userList')
    }catch(error){
        console.log(error.message);
    }
  }

  const unblock=async(req,res)=>{
    try{
        const userData=await User.findByIdAndUpdate(req.query.id,{$set:{is_block:false}});
        res.redirect('/admin/userList')
    }catch(error){
        console.log(error.message);
    }
  }


  const loadAddBanner=async(req,res)=>{
    try{
      
       const admin=req.session.admin_id
      const adminData = await User.findOne({ _id:admin });
      const banner= await Banner.find({})
      
      res.render('bannerlist',{admin:adminData, banner})
    }catch(err){
      console.log(err.message);
    }
  }

  const addBanner = async (req, res) => {
    try {
       
      const adminid = req.session.Auser_id;
      const adminData = await User.findOne({ _id: adminid });
      const banner = new Banner({
        
        
       
        banner_img: req.file.filename,
        first_text: req.body.mainText,
        main_text: req.body.firstText,
        first_text2:req.body.firstText2,
        main_text2:req.body.mainText2

      });
  
      const bannerData = await banner.save();
      
      if (bannerData) {
        res.render("bannerlist", {
          message: "Product added successfully",
          admin: adminData,
          banner:bannerData
          });
      } else {   
        return res.render("bannerlist", {
          message: "Enter valid details",
          admin: adminData,
          
        });
      }
    } catch (err) {
      console.log(err.message);
    }
  };
  
  

 

module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    newUserLoad,
    adminLogout,
    block,
    unblock,
    loadAddBanner,
     addBanner,
     loadSalesReport
}