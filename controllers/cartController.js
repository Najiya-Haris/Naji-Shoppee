const Category = require("../Models/categoryModel");
const User = require("../Models/userModel");
const Product = require("../Models/productModel");
const Cart = require("../Models/cartModel");
const Address=require('../Models/addressModel');
const { render } = require("../routes/userRoute");
const coupen=require('../Models/couponModel')


const loadCart = async (req, res,next) => {
  try {
    const session = req.session.user_id
    let userName = await User.findOne({ _id: req.session.user_id });
    let cartData = await Cart.findOne({ userId: req.session.user_id }).populate(
      "products.productid"
    );
    const userId = userName._id;
    let Total=0
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
        

           Total = total.length > 0 ? total[0].total : 0; 
            
         
          res.render("cart-page", { products: products, Total: Total, userId ,session});
        } else {
          res.render("cart-page", { products: [], Total: Total, userId ,session});
          return
        }
      } else {
        res.render("cart-page", { products: [], Total: Total, userId ,session});
        return
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    next(error)
  }
};


const addToCart = async (req, res,next) => {
    try {
      const userId = req.session.user_id;
      const userData = await User.findOne({ _id: userId });
     
      const productId = req.body.id;
      const productData = await Product.findOne({_id: productId});
      
      const cartData = await Cart.findOne({ userId: userId });

      const discount =  productData.discountPercentage 

      const price =  productData.price 
 
      const disAmount = Math.round((price*discount)/100)
 
      const total = price - disAmount

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
                  productPrice: total,
                  totalPrice:total 
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
            productPrice: total,
            totalPrice:total
          }],
        });
  
        await newCart.save();
      }
      res.json({ success: true });
    } catch (error) {
      next(error)
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
      
      const productQuantity = productData.stockQuantity
      
  
      const updatedCartData = await Cart.findOne({ userId: userData });
      const updatedProduct = updatedCartData.products.find((product) => product.productid === proId);
      const updatedQuantity = updatedProduct.count;
      
      
      if (count > 0) {
        // Quantity is being increased
        if (updatedQuantity + count > productQuantity) {
          res.json({ success: false, message: 'Quantity limit reached!' });
          return;
        }
      } else if (count < 0) {
        // Quantity is being decreased
        if (updatedQuantity <= 1 || Math.abs(count) > updatedQuantity) {
          await Cart.updateOne(
            { userId: userData },
            { $pull: { products: { productid: proId } } }
          );
          res.json({ success: true });
          return;
        }
      }
      
      const cartdata = await Cart.updateOne(
        { userId: userData, "products.productid": proId },
        { $inc: { "products.$.count": count } }
      );
      
      const updateCartData = await Cart.findOne({ userId: userData });
      const updateProduct = updateCartData.products.find((product) => product.productid === proId);
      const updateQuantity = updateProduct.count;
   
  
      const discount =  productData.discountPercentage 
  
      const price =  productData.price 
  
      const disAmount = Math.round((price*discount)/100)
  
      const total = price - disAmount
  
      const priceChange = updateQuantity * total;
      
      await Cart.updateOne(
        { userId: userData, "products.productid": proId },
        { $set: { "products.$.totalPrice": priceChange } }
      );
      
      res.json({ success: true });
      
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  



  //delete Product from cart



const deleteCartProduct = async (req, res,next) => {

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
   next(error)
    res.status(500).json({ success: false, error: error.message });
  }
};



//loading checkoutpage

const loadChekout = async(req,res,next)=>{
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
  next(error)
  }
}

module.exports={
    loadCart ,
    addToCart ,
    changeProductCount,
    deleteCartProduct,
    loadChekout
}