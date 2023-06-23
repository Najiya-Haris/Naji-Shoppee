const Category = require("../Models/categoryModel");
const User = require("../Models/userModel");
const Product = require("../Models/productModel");
const Cart = require("../Models/cartModel");
const Address=require('../Models/addressModel');
const { render } = require("../routes/userRoute");
const coupen=require('../Models/couponModel')


const loadCart = async (req, res) => {
  try {
    const session = req.session.user_id
    let userName = await User.findOne({ _id: req.session.user_id });
    let cartData = await Cart.findOne({ userId: req.session.user_id }).populate(
      "products.productid"
    );
    if (req.session.user_id) {
      if (cartData) {
        if (cartData.products.length > 0) {
          const products = cartData.products;
          const total = await Cart.aggregate([
            { $match: { userId: req.session.user_id } },
            { $unwind: "$products" },
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$products.productPrice", "$products.count"] } },
              },
            },
          ]);
        

          const Total = total.length > 0 ? total[0].total : 0; 
           const totalAmount = Total+80;   
          const userId = userName._id;
          res.render("cart-page", { products: products, Total: Total, userId ,session,totalAmount});
        } else {
          res.render("empty-cart-page", {
            userName,
            session,
            message: "No Products Added to cart !",
          });
          return
        }
      } else {
        res.render("empty-cart-page", {
          userName,
          session,
          message: "No Products Added to cart",
        });
        return
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const addToCart = async (req, res) => {
    try {
      const userId = req.session.user_id;
      console.log(userId);
      const userData = await User.findOne({ _id: userId });
     
      const productId = req.body.id;
      const productData = await Product.findOne({_id: productId});
      
      const cartData = await Cart.findOne({ userId: userId });

      if (cartData) {
       
        const productExists = cartData.products.some(
          (products) => products.productid == productId
        );
  
        if (productExists) {
          await Cart.findOneAndUpdate(
            { userId: userId, "products.productid": productId },
            { $inc: { "products.$.count": 1,"products.$.totalAmount":productData.price } }
          );
        } else {
          await Cart.findOneAndUpdate(
            { userId: userId },
            { 
              $push: { 
                products: { 
                  productid: productId,
                  productPrice: productData.price,
                  totalPrice:productData.price 
                } 
              } 
            }
          );
        }
        
      } else {
        const newCart = new Cart({
          userId: userId,
          username: userData.name,
          products: [{ 
            productid: productId,
            productPrice: productData.price,
            totalPrice:productData.price
          }],
        });
  
        await newCart.save();
      }
      res.json({ success: true });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };

  const changeProductCount = async (req, res) => {
    try {
      const userData = req.session.user_id;
      const proId = req.body.product;
      let count = req.body.count;
      count = parseInt(count);
      const cartData = await Cart.findOne({ userId: userData });
      const product = cartData.products.find((product) => product.productid === proId);
      const productData = await Product.findOne({ _id: proId });
      
      const cartdata = await Cart.updateOne(
        { userId: userData, "products.productid": proId },
        { $inc: { "products.$.count": count } }
      );

      const updatedCartData = await Cart.findOne({ userId: userData });
      const updatedProduct = updatedCartData.products.find((product) => product.productid === proId);
      const updatedQuantity = updatedProduct.count;
      
      if (updatedQuantity < 1) {
        await Cart.updateOne(
          { userId: userData },
          {
            $pull: { products: { productid: proId } }
          }
        );
      }
  
      const price = updatedQuantity * productData.price;
      
      await Cart.updateOne(
        { userId: userData, "products.productid": proId },
        { $set: { "products.$.totalPrice": price } }
      );
      
      res.json({ success: true });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  };


  //delete Product from cart



const deleteCartProduct = async (req, res) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    const cartData = await Cart.findOne({ userId: userData });
    
    if (cartData.products.length === 1) {

      await Cart.deleteOne({ userId: userData });
    } else {
     
      await Cart.updateOne(
        { userId: userData },
        { $pull: { products: { productid: proId } } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};



//loading checkoutpage

const loadChekout = async(req,res)=>{
  try {
    const session = req.session.user_id
    const userData = await User.findOne ({_id:req.session.user_id});
    const addressData = await Address.findOne({userId:req.session.user_id});
    const coupenData=await coupen.find({})
    const total = await Cart.aggregate([
      { $match: { userId: req.session.user_id } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$products.productPrice", "$products.count"] } },
        },
      },
    ]);
    const Total = total.length > 0 ? total[0].total : 0; 
   const totalAmount = Total+80;

    if(req.session.user_id){
      if(addressData){
          if(addressData.addresses.length>0){
            const address = addressData.addresses
            
            res.render('checkout-page',{session,Total,address,totalAmount,user:userData,coupen:coupenData})
          }
          else{
            res.render('empty-checkout',{session,Total,totalAmount,user:userData,coupen:coupenData})
          }
        }else{
          res.render('empty-checkout',{session,Total,totalAmount,user:userData,coupen:coupenData});
        }
      }else{
        res.redirect('/')
      }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports={
    loadCart ,
    addToCart ,
    changeProductCount,
    deleteCartProduct,
    loadChekout
}