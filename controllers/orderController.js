const Cart = require("../Models/cartModel");
const User = require("../Models/userModel");
const Product = require("../Models/productModel");
const Order = require('../Models/orderModel')
const razorpay = require('razorpay')

//instance creating for razorpay

  var instance = new razorpay({
    key_id:process.env.Razorpay_key_id,
    key_secret:process.env.Razorpay_key_Secret,
  })

//place order

const placeOrder = async (req, res,next) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    const address = req.body.address;
    const cartData = await Cart.findOne({ userId: req.session.user_id });
    const products = cartData.products;
    const total = parseInt(req.body.Total);
    const paymentMethod = req.body.payment;
    const status = paymentMethod === 'COD' ? 'placed' : 'pending';

    const order = new Order({
      deliveryAddress: address,
      userId: req.session.user_id,
      userName: userData.name,
      paymentMethod: paymentMethod,
      products: products,
      totalAmount: total,
      status: status,
      date: new Date(),
    });

    const orderData = await order.save();
    const orderid=order._id

  
     

      if (orderData) {
        //cash on delivery
      if (order.status === 'placed') {
        await Cart.deleteOne({ userId: req.session.user_id });
        for (let i = 0; i < products.length; i++) {
          const pro = products[i].productid;
          const count = products[i].count;
          await Product.findByIdAndUpdate({ _id: pro }, { $inc: { quantity: -count } });
        }
  
        res.json({ codsuccess: true ,orderid});
      } else {
      
        //wallet payment
        if(order.paymentMethod === 'Wallet-Payment'){
          const wallet = userData.wallet
          if(wallet >= total){
            await Cart.deleteOne({ userId: req.session.user_id });
            for (let i = 0; i < products.length; i++) {
              const pro = products[i].productid;
              const count = products[i].count;
              await Product.findByIdAndUpdate({ _id: pro }, { $inc: { quantity: -count } });
              await User.findOneAndUpdate({_id:req.session.user_id},{$inc:{wallet: -total}})
              await Order.findOneAndUpdate({_id:order._id},{$set:{status:"placed"}});
              res.json({ codsuccess: true ,orderid});
            }
          }else{
            res.json({walletFailed:true});
          }
        }else{

          //razor payment
        const orderId = orderData._id;
        const totalAmount = orderData.totalAmount;
        var options = {
          amount: totalAmount * 100,
          currency: 'INR',
          receipt: '' + orderId,
        };

        instance.orders.create(options, function (err, order) {
            res.json({ order });
          
        });
      }
    } 
    } else {
      res.redirect('/');
    }
  } catch (error) {
  next(error)
    res.status(500).json({ error: 'Internal server error' });
  }
};

  //verify payment from razorpay

  const verifyPayment = async (req,res,next)=>{
    try{
      const cartData = await Cart.findOne({ userId: req.session.user_id });
      const products = cartData.products;
      const details = req.body
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.Razorpay_Key_Secret);
      hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
      const hmacValue = hmac.digest('hex');
    
      if(hmacValue === details.payment.razorpay_signature){
        for (let i = 0; i < products.length; i++) {
          const pro = products[i].productid;
          const count = products[i].count;
          await Product.findByIdAndUpdate({ _id: pro }, { $inc: { quantity: -count } });
        }
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
        await Cart.deleteOne({userId:req.session.user_id});
        const orderid = details.order.receipt 
        res.json({ codsuccess: true ,orderid});
      }else{
        await Order.findByIdAndRemove({_id:details.order.receipt});
        res.json({success:false});
      }
    }catch(error){
      next(error)
   }
  }

//load order management

const loadOrderManagement = async(req,res,next) =>{
  try {
    const adminData = await User.findById(req.session.Auser_id)
    const orderData = await Order.find().populate("products.productid").sort({ date: -1 });

    res.render('order-management',{admin:adminData,order:orderData})
    
  } catch (error) {
   next(error)
  }
}

//wallet history

const loadwallethistory=async(req,res,next)=>{
  try{
    const session = req.session.user_id
    const userData = await User.findById({_id:session})
    const orderData = await Order.findOne({paymentMethod:'Wallet-Payment',userId:session}).populate(
      "products.productid"
    );
    if(orderData){
      console.log(orderData.length);

      res.render("wallethistory",{orders:orderData,session,userData})

    }else{
      res.render("wallethistory",{orders:nullrs,session,userData})
    }
  

      

    
  }catch(error){
    next(error)
  }

}


  //single order detail page in adminside

  const loadSingleDetails = async(req,res,next)=>{
    try {
      const id = req.params.id
      const adminData = await User.findById(req.session.Auser_id)
      const orderData = await Order.findOne({_id : id }).populate(
        "products.productid"
      );
      const orderDate = orderData.date
      const expectedDate  = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000));
      res.render('single-order',{ admin:adminData,orders:orderData,expectedDate});
    } catch (error) {
     next(error)
    }
  }

 //load my order

  const loadMyOrder = async (req, res,next) => {
    try {
      const session = req.session.user_id;
      const user = await User.findById(session);
      const orderData = await Order.find({ userId: session }).populate("products.productid").sort({ date: -1 });
      
      const orderProducts = orderData.map(order => order.products); 
  
      res.render('my-orders', { session, user, orderProducts,orderData });
    } catch (error) {
  next(error)
    }
  };


  //single order page loading

  const loadSingleOrder = async(req,res,next)=>{
    try {
      const id = req.params.id
      const session = req.session.user_id
      const orderData = await Order.findOne({_id : id }).populate(
        "products.productid"
      );
      const orderDate = orderData.date
      const expectedDate  = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000));
      res.render('single-order-page', { session,orders:orderData,expectedDate});
    } catch (error) {
      next(error)
    }
  }

  const orderReturn = async (req, res,next) => {
    try {
      const id = req.body.orderid;
      const reason = req.body.reason
      const ordersId = req.body.ordersid;
      const Id = req.session.user_id
      const orderData = await Order.findOne({ userId: Id, 'products._id': id})
      const product = orderData.products.find((p) => p._id.toString() === id);
      const cancelledAmount = product.totalPrice  
      const proId = product.productid 
      const proCount = product.count
      const updatedOrder = await Order.findOneAndUpdate(
        {
          userId:Id,
          'products._id': id
        },
        {
          $set: {
            'products.$.status': 'returned',
            'products.$.returnReason': reason
          }
        },
        { new: true }
      );

      if (updatedOrder) {
        await Product.findByIdAndUpdate(proId,{$inc:{StockQuantity:proCount}})
        await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:cancelledAmount}})
        await Order.findOneAndUpdate({userId:req.session.user_id,'products._id': id},{$inc:{'products.$.totalPrice':-cancelledAmount}})
        await Order.findOneAndUpdate({userId:req.session.user_id,'products._id': id},{$inc:{totalAmount:-cancelledAmount}})
        res.redirect("/single-order-page/" + ordersId)
      } else {
        res.redirect("/single-order-page/" + ordersId)
      }
    } catch (error) {
     next(error)
    }
  };

  //order canceling

  const orderCancel = async (req, res,next) => {
    try {
      const id = req.body.id;
      const userData = await Order.findById(req.session.user_id)
      const orderData = await Order.findOne({ userId: req.session.user_id, 'products._id': id})
      const product = orderData.products.find((p) => p._id.toString() === id);
      const cancelledAmount = product.totalPrice     
      const updatedOrder = await Order.findOneAndUpdate(
        {
          userId: req.session.user_id,
          'products._id': id
        },
        {
          $set: {
            'products.$.status': 'cancelled'
          }
        },
        { new: true }
      );

  
      if (updatedOrder) {
        if(orderData.paymentMethod === 'online-payment'){
           await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:cancelledAmount}})
           res.json({ success: true });
        }else{
           res.json({ success: true });
        }
      } else {
        res.json({ success: false });
      }
    } catch (error) {
    next(error)
    }
  };

  //changing order status

  const changeStatus = async(req,res,next) =>{
    try {
      const id = req.body.id
      const userId = req.body.userId
      const statusChange = req.body.status
      const updatedOrder = await Order.findOneAndUpdate(
        {
          userId: userId,
          'products._id': id
        },
        {
          $set: {
            'products.$.status': statusChange
          }
        },
        { new: true }
      );
      
      if(statusChange === 'Delivered'){
        const updatedDate = await Order.findOneAndUpdate(
          {
            userId: userId,
            'products._id': id
          },
          {
            $set: {
              'products.$.deliveredDate': new Date()
            }
          },
          { new: true }
        );
      }

      if(updatedOrder){
        res.json({success:true})
      }
    } catch (error) {
     next(error)
    }
  }
  //load order success page
  
  const loadOrderSuccess = async(req,res,next)=>{
    try {
      const id = req.params.id
      const session = req.session.user_id
      const orderData = await Order.findOne({_id : id }).populate(
        "products.productid"
      );
      const orderDate = orderData.date
      const expectedDate  = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000));
      res.render('order-success', { session,orders:orderData,expectedDate});
    } catch (error) {
      next(error)
    }
  }


    module.exports = {
        placeOrder,
        loadMyOrder,
        verifyPayment,
        loadSingleOrder,
        loadOrderManagement,
        loadSingleDetails,
        changeStatus,
        orderCancel,
        loadOrderSuccess,      
        orderReturn,
        loadwallethistory
    }