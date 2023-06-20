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
      if(req.session.user_id ){
      const userData= await userModel.findOne({_id:req.session.user_id}) 
      if(userData.is_block==false && userData.is_admin==0){
        next()
        console.log('blocked');
      }else{
        console.log('not blked');
        req.session.destroy()
        res.redirect("/")
      }
      }else{
        next()
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