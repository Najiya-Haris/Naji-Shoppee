const userModel=require("../Models/userModel")

const isLogin = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        // User is logged in, continue to next middleware or route handler
        next();
      } else {
        // User is not logged in, redirect to login page
        res.redirect("/");
      }
    } catch (err) {
      console.log(err.message);
    }
  };
  
  const isLogout = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        // User is logged in, redirect to home page
        res.redirect("/home");
      } else {
        // User is not logged in, continue to next middleware or route handler
        next();
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const isBlock =async(req,res,next)=>{
    try {
      
      const userData= await userModel.findOne({_id:req.session.user_id}) 
      if(userData){
      if(userData.is_block==false){
        next()
      }else{
        req.session.destroy()
        res.send("Sorry, you are blocked from accessing this page.");
        res.redirect("/")
      }
      }else{
        res.redirect("/")

      }
    
   } catch (err) {
      console.log(err.message);
      next(err);
    }
  }
  
  
  module.exports = {
    isLogin,
    isLogout,
    isBlock
  };