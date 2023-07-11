const User = require("../Models/userModel");
const Coupen = require('../Models/couponModel')
const Product=require("../Models/productModel")

//load coupen list in admin page 

const loadCoupenController = async(req,res,next)=>{
    try {
        const adminData = await User.findById({ _id: req.session.Auser_id });
        const coupenData = await Coupen.find()
        res.render('coupen-list',{admin:adminData,coupen:coupenData})
    } catch (error) {
       next(error)
    }
} 

//insert coupen

const insertCoupen = async(req,res,next) =>{
    try {

        const adminData = await User.findById({ _id: req.session.Auser_id });
        const coupenData = await Coupen.find()

        //exist code in coupon checking

        const existCode = await Coupen.findOne({code:req.body.code})
        if(existCode){
           return res.render('coupen-list',{ admin:adminData , coupen:coupenData , message:'coupon code already used'})
        }

        //discount pecentage validation

        if(req.body.percentage < 0){
            return res.render('coupen-list',{ admin:adminData , coupen:coupenData , message:'negative not allowed'})
        }else if(req.body.percentage > 80){
            return res.render('coupen-list',{ admin:adminData , coupen:coupenData , message:'maximum discount is 80 !!!'})

        }

        // date validation 

        const startDate = new Date(req.body.startdate);
        const endDate = new Date(req.body.expirydate);

        const today = new Date();
        const oneDayAhead = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        if (isNaN(startDate) || startDate < oneDayAhead || isNaN(endDate) || endDate < oneDayAhead) {
          return res.render('coupen-list', { admin: adminData, coupen: coupenData, message: 'Invalid date' });
        }

        //white space checking
        
        if(req.body.code.trim() == '' || req.body.discount.trim() == "" ){
            return res.render('coupen-list', { admin: adminData, coupen: coupenData, message: 'Invalid input' });
        }
        


        const coupen = new Coupen({
            code:req.body.code.trim(),
            discountType:req.body.discount.trim(),
            startDate:req.body.startdate,
            expiryDate:req.body.expirydate,
            discountPercentage:req.body.percentage.trim(),
        })

        const coupeData = await coupen.save()
        if(coupeData){
            res.redirect('/admin/coupen-list')
        }else{
            message='something error'
            res.redirect('/admin/coupen-list')
        }    
    } catch (error) {
   next(error)
    }
}

//update coupen

const updateCoupen = async(req,res,next)=>{
    try {
        const id = req.params.id
        console.log(id);
        const updateCoupen = await Coupen.findOneAndUpdate({_id:id},{
            $set:{
                code:req.body.code.trim(),
                discountType:req.body.discount.trim(),
                startDate:req.body.startdate,
                expiryDate:req.body.expirydate,
                discountPercentage:req.body.percentage.trim(),
            }
        })
        if(updateCoupen){
            res.redirect('/admin/coupen-list')
        }else{
            message='something error'
            res.redirect('/admin/coupen-list')
        }
    } catch (error) {
       next(error)
    }
}

//delete coupen

const deleteCoupen = async(req,res,next) =>{
    try {
        const id = req.body.id
        const deleteCoupen = await Coupen.deleteOne({_id:id})
        if(deleteCoupen){
            res.json({success:true}) 
        }else{
            res.json({success:false})
        }
    } catch (error) {
     next(error);
    }
}



//applying coupen in user side

const applyCoupen = async(req,res,next)=>{
    try {
      const code = req.body.code;
      const amount = Number(req.body.amount)

      const userExist = await Coupen.findOne({code:code,user:{$in:[req.session.user_id]}})
      if(userExist){
        res.json({user:true})
      }else{
        const coupendata = await Coupen.findOne({code:code})
        if(coupendata){
            if(coupendata.expiryDate <= new Date()){
                res.json({date:true})
            }else{
                await Coupen.findOneAndUpdate({_id:coupendata._id},{$push:{user:req.session.user_id}}) 
                const perAmount = Math.round((amount * coupendata.discountPercentage)/100 )
                const disTotal =Math.round(amount - perAmount)
                return res.json({amountOkey:true,disAmount:perAmount,disTotal})
            }
        }
      }
      res.json({invalid:true})
    } catch (error) {
       next(error)
    }
}
const addOffer = async(req,res,next)=>{
    try {
        
        const proId = req.body.proId
     
        const percentage = req.body.percentage
       
        const name = req.body.name
       
        const productDatas = await Product.find({is_delete:false});
        console.log(productDatas);

         //discount pecentage validation
 
         if(percentage < 0){
            return res.render('productList',{ admin:adminData , product:productDatas , message:'negative not allowed'})
        }else if(percentage > 80){
            return res.render('productList',{ admin:adminData , product:productDatas , message:'maximum discount is 80 !!!'})

        }

        const updateProduct = await Product.findOneAndUpdate(
            { _id: proId },
            {
              $set: {
                discountName: name,
                discountPercentage: percentage
              }
            },
            { new: true }
          );  
         res.redirect("/admin/productList");  

    } catch (error) {
        
    }
}


module.exports = {
    loadCoupenController,
    insertCoupen,
    updateCoupen,
    deleteCoupen,
    applyCoupen,
    addOffer

}