const { Model } = require("mongoose");
const User = require("../Models/userModel");
const Address = require("../Models/addressModel")



//loading add addresss page

const loadAddAddress = async(req,res,next)=>{
    try {
      const session = req.session.user_id
      res.render('add-address',{session})
    } catch (error) {
       next(error)
    }
}


const insertAddress = async(req,res,next)=>{
    try {
        const addressDetails = await Address.findOne({userId:req.session.user_id});
       if(addressDetails){
        const updateOne = await Address.updateOne({userId:req.session.user_id},{$push:{addresses:{
            username:req.body.username,
            mobile:req.body.mobile,
            housename:req.body.housename,
            landmark:req.body.landmark,
            city:req.body.city,
            state:req.body.state,
            pincode:req.body.pincode,
                                      }}});
            if(updateOne){
                res.redirect('/checkout-page')
            }else{
                res.redirect('/');
            }
       }else{
        const address = new Address({
            userId:req.session.user_id,
            addresses:[{
                username:req.body.username,
                mobile:req.body.mobile,
                housename:req.body.housename,
                landmark:req.body.landmark,
                city:req.body.city,
                state:req.body.state,
                pincode:req.body.pincode,
            }]
        })      
        const addressData = await address.save();
        if(addressData){
        res.redirect('/checkout-page');
    }else{
        res.redirect('/checkout-page');

    }
}
    } catch (error) {
        next(error)
    }
}


//load edit address

const loadEditAddress = async(req,res,next)=>{
    try {
        const session = await User.findById(req.session.user_id)
        const addressdata = await Address.findOne({userId:req.session.user_id},{addresses:{$elemMatch:{_id:req.query.id}}});
        const address = addressdata.addresses;
        res.render('edit-address',{session,address:address[0]})

    } catch (error) {
       next(error)
    }
}


// updating edited address
          
          
const updateAddress = async (req,res,next) =>{
    try{
      
    const session = req.session.user_id;
    const id = req.query.id;
    const address = await Address.updateOne({ userId: session }, { $pull: { addresses: { _id: id } } });
    const pushAddress = await Address.updateOne({userId:session},
        {$push:
        {addresses:{
            username:req.body.username,
            mobile:req.body.mobile,
            housename:req.body.housename,
            landmark:req.body.landmark,
            city:req.body.city,
            state:req.body.state,
            pincode:req.body.pincode,
        }
        }})
        res.redirect('/checkout-page')
} catch (error) {
next(error)
}
}




//delete address
const deleteAddress = async (req, res,next) => {
    try {
      const id = req.session.user_id;
      const addId = req.body.address;
      const addressData = await Address.findOne({ userId: id });
      if (addressData.addresses.length === 1) {
        await Address.deleteOne({ userId: id });
      } else {
        await Address.updateOne(
          { userId: id },
          { $pull: { addresses: { _id: addId } } }
        );
      }
      res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
      next(error)
      res.status(500).json({ error: "An error occurred while deleting the address" });
    }
  };

module.exports={
    loadAddAddress,
    insertAddress,
    loadEditAddress,
    updateAddress,
    deleteAddress
}
   
