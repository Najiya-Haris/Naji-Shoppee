const User= require('../Models/userModel')
const bcrypt=require('bcrypt')
const express= require('express')
const session=require('express-session')
const nodemailer=require("nodemailer")
const config=require("../config/config")
const product = require('../Models/productModel')
const category=require('../Models/categoryModel')
const { isBlock } = require('../middlewear/Auth')
const Banner=require('../Models/bannerModel')

let otp;

const securePassword= async(password)=>{
    try{
        const passwordHash=await bcrypt.hash(password,10)
        return passwordHash
    }catch(err){
        console.log(err.message);
    }
}



//for sent mail

const sendverifyMail=async(name,email,otp)=>{
  try {
    const transporter=nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:process.env.mail,
        pass: process.env.password
      }
    });
    const mailOption={
      form:config.emailUser,
      to:email,
      subject:'For Verification mail',
      html:'<p>Hi '+name+', please click here to <a href="http://localhost:2040/otp">verify</a> and enter the for your verification' +email+' this is your otp' +otp+ '</p>',
    
  }
  transporter.sendMail(mailOption,function(error,info){
    if (error) {
      console.log(error);
    } else {
      console.log("Email has been send",info.response);
      console.log(otp);
    }
  })

}
catch (error) {
   console.log(error.message);
  }
}


const reSendMail = async(req,res)=>{
  try {
    const userData = await User.find({email:email})
    const name = userData.name
    sendverifyMail(name,email,otp)
    res.redirect('/verify')
  } catch (error) {
    console.log(error.message);
  }
}


const loadVerfication = async(req,res,next)=>{
   
    try {
      const session = req.session.user_id;
      
      if (!session) {
        return res.render("verify",{session:session});
      }
  
      const userData = await User.findById({_id:req.session.user_id});
      if (userData) {
        return res.render("verify", { user: userData,session});
      } else {
        const session = null
        return res.render("verify",{session});
      }
    } catch (error) {
     next(error)
    }
    }




    const loadHome = async (req, res,next) => {
      try {
        const session = req.session.user_id;
        const productData = await product.find()
        const banner= await Banner.find({})
        const banners= await Banner.find().skip(1).limit(1)
        console.log(banner);
        
        if (!session) {
          return res.render("home",{session:session,product:productData,banner,banners});
        }
    
        const userData = await User.findById({_id:req.session.user_id});
        if (userData) {
          return res.render("home", { user: userData,session,product:productData,banner,banners});
        } else {
          const session = null
          return res.render("home",{session,product:productData,banner});
        }
      } catch (error) {
       next(error)
      }
    };

const loginLoad= async(req,res,next)=>{
    try{
        res.render('login')
    }catch(error){
   next(error)
    }
 }

 const loadRegister= async(req,res,next)=>{
    try{
        res.render('register')
    }catch(err){
      next(error)
    }
}

let email;

const insertUser=async(req,res,next)=>{
    try{
      
        const spassword=await securePassword(req.body.password)
        console.log(spassword);
           const user =new User({
            name:req.body.name,
            email:req.body.email,
            phonenumber:req.body.phonenumber,
            password:spassword,
            
            
        })
       
        

        email=user.email;
        const name=req.body.name
    const userData= await user.save()

    if(userData){
        randomnumber=Math.floor(Math.random()*9000)+1000;
         otp=randomnumber
            console.log(otp,"===",req.body.email);
            sendverifyMail(name,req.body.email,randomnumber)
            res.redirect("/verify")
    }else{
        res.render('register',{message:"Your registration has been failed"})
    }

    }catch(err){
       next(error)
    }
}


const verifyLogin=async(req,res,next)=>{
    try{
        const email=req.body.email
        console.log(email);
        const password=req.body.password
        console.log(password);
        const userData=await User.findOne({email:email,is_block:false})
        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password)
            if(passwordMatch){
              console.log(2435678);
              req.session.user_id=userData._id
                res.redirect('/')
                
            }else{
                res.render('login',{message:'email or password is incorrect'})
                console.log('incorrect');
            }
        }else{
            res.render('login',{message:'email or password is incorrect'})
        }
    }catch(error){
       next(error)
    }
    
}


const userLogout= async(req,res)=>{
    try{
      console.log('hiiii')
        req.session.destroy()
        res.redirect('/')
    }catch(err){
        console.log(err.message);
    }
}

//  Verifying the users otp and redirecting to login page
//  =====================================================


const verifyLoad = async (req, res, next) => {
  const otp2 = req.body.otp;
  console.log( email );
  try {
    if (otp2 == otp) {
      const userData = await User.findOneAndUpdate(
        { email: email },
        { $set: {is_verified: true} }
      );

      if (userData) {
      
        res.redirect("/login");
      } else {
        res.render("verify", { message: "please check the otp again" });
      }
    } else {
      res.render("verify", { message: "please check the otp again" });
    }
  } catch (error) {
    next(error)
  }
};


  const loadshop=async(req,res)=>{
    try{
        res.render("shop")
    }catch(error){
        console.log(error);
    }
  }



  const loadProducts = async (req,res)=>{
    try {
        const session = req.session.user_id;
        const productData = await product.find({is_delete:false})
        const categoryData = await category.find({is_delete:false});
        
        if (!session) {
          return res.render("product",{session:session
            ,category:categoryData
            ,product:productData});
        }
    
        const userData = await User.findById({_id:req.session.user_id});
        if (userData) {
          return res.render("product", { user: userData,session,
            category:categoryData,
            product:productData});
        } else {
          const session = null
          return res.render("product",{session,
            category:categoryData,
            product:productData});
        }
      } catch (error) {
        console.log(error.message);
      }
}


//-------userprofile

const loadProfile = async(req,res)=>{
  try {
      const session = req.session.user_id;
     
       
      const userName =await User.findOne({_id:req.session.user_id});
      res.render('profile',{userName,session});
  } catch (error) {
      console.log(error.message);
  }
}

//update user profile

const updateUser = async (req, res) => {
  try {
    const name = req.body.name;
    const mobile = req.body.phonenumber;
    console.log(mobile);
    const userData = await User.findByIdAndUpdate(
      req.session.user_id,
      { name: name, phonenumber: mobile },
      { new: true }
    );
    await userData.save();

    if (userData) {
      res.redirect('/profile');
    } else {
      res.redirect('/profile');
    }
  } catch (error) {
    console.log(error.message);
  }
};


//forget password

const forgetLoad = async(req,res)=>{
  try {
    res.render('forget')
  } catch (error) {
    console.log(error.message);
  }
}


const sendResetPassword=async(name,email,otp3)=>{
  try {
    otp_to_verify=otp3
    console.log( otp_to_verify+'otp veriy is');
    const transporter=nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:process.env.mail,
        pass: process.env.password
      }
    });
    const mailOption={
      form:config.emailUser,
      to:email,
      subject:'For Verification mail',
      html:'<p>Hi '+name+', please click here to <a href="http://localhost:2040/otp">verify</a> and enter the for your verification' +email+' this is your otp' +otp3+ '</p>',
    
  }
  transporter.sendMail(mailOption,function(error,info){
    if (error) {
      console.log(error);
    } else {
      console.log("Email has been send",info.response);
      console.log(otp);
    }
  })

}
catch (error) {
    console.log(error.message);
  }
}

//forget password
const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    emalreset=email
    console.log("1"+emalreset);
    
    const userData = await User.findOne({ email: email });
    if (userData) {
      randomnumber = Math.floor(Math.random() * 9000) + 1000;
      otp3 = randomnumber;
      if (userData.is_verified == false) {
        res.render("forget", { message: "please Verify Your mail"});
      } else {
        randomnumber = Math.floor(Math.random() * 9000) + 1000;
        otp3 = randomnumber;
        sendResetPassword(userData.name,userData.email,otp3)
        res.render('forget',{message:'please check mail and enter OTP'})
      }
    }else{
      res.render('forget',{message:'email is incorrect'})
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyForgetOtp = async (req, res) => {
  try {
    const otp4=req.body.otp4
    console.log(otp4 + 'this is otp from user entered');
  
    if(otp4== otp_to_verify){
      
     res.redirect('/loadchange')
    }else{
      res.render('forget',{message:"something went wrong"})
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadchangePasswod = async(req,res)=>{
  try {
    res.render('changePassword')
  } catch (error) {
    console.log(error.message);
  }
}


const changePassword=async(req,res)=>{
  try {
    console.log(emalreset);
    
    const password=req.body.password;
    const confPassword=req.body.confPassword;
    const passwordHash=await bcrypt.hash(password,10)
    
    if(password==confPassword){
      const user1=await User.findOneAndUpdate({email:emalreset},{$set:{password:passwordHash}})
      console.log(user1);
      res.redirect('/login')
    }else{
      res.render('changePassword',{message:'password is not matching'})
    }

  } catch (error) {
    console.log(error.message);
  }
}
// categorywise filter

const filterCategory = async (req, res) => {
  try {
    const session = req.session.user_id;
    const categoryname = req.params.id;
    const categoryData = await category.find({ is_delete: false });
    const productData = await product.find({ category: categoryname, is_delete: false });

    if (categoryData.length > 0) {
      res.render("product", {
        product: productData,
        session,
        category: categoryData,
      });
    } else {
      res.render("product", { product: [], session, category: categoryData });
    }
  } catch (error) {
    console.log(error.message);
  }
};




module.exports={
    loadHome,
    loginLoad,
    loadRegister,
    insertUser,
    verifyLogin,
    userLogout,
    loadVerfication,
    sendverifyMail,
    verifyLoad,
    loadshop,
    loadProducts,
    loadProfile,
    forgetLoad,
    forgetVerify,
    sendResetPassword,
    verifyForgetOtp,
    loadchangePasswod,
    changePassword ,
    filterCategory ,
    updateUser,
    reSendMail
    
}