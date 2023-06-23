const express= require('express')
const user_route=express()
const session=require('express-session')
const Auth=require("../middlewear/Auth")
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const addressController = require('../controllers/addressController')
const couponController = require('../controllers/couponController')
const config=require('../config/config')
// user_route.use(session({
//     secret:config.sessionSecret,
//     resave:false,
//     saveUninitialized:false
// }))

user_route.set('view engine','ejs')
user_route.set('views','./views/user')

const bodyParser=require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({ extended: true }))

const userController=require('../controllers/userControllers')


user_route.get('/',userController.loadHome)
user_route.get('/home', userController.loadHome);

user_route.get('/login',Auth.isLogout,userController.loginLoad)
user_route.post('/login',userController.verifyLogin)
user_route.get('/register',userController.loadRegister)
user_route.post('/register',userController.insertUser)


user_route.get('/verify',userController.loadVerfication)
user_route.post('/verify',userController.verifyLoad)
user_route.get('/reSend',userController.reSendMail)

user_route.get('/product',Auth.isBlock,userController.loadProducts)

user_route.get('/logout',Auth.isLogin,userController.userLogout);
user_route.get('/singleProduct',Auth.isBlock,productController.productDetails)

user_route.get('/profile',Auth.isLogin,userController.loadProfile);

user_route.post('/update-user',Auth.isLogin,userController.updateUser)



user_route.get('/forget',Auth.isBlock,userController.forgetLoad)

user_route.get('/loadchange',Auth.isBlock,userController.loadchangePasswod )
user_route.post('/forget',Auth.isBlock,userController.forgetVerify)
user_route.post('/verifyotp',Auth.isBlock,userController.verifyForgetOtp )
user_route.post('/changePassword',Auth.isBlock,userController.changePassword )

user_route.get('/cart',cartController.loadCart)
user_route.post('/addtocart',cartController.addToCart)
//user_route.get("/removeProduct", cartController.removeProduct);
user_route.post("/changeQuantity",Auth.isLogin,cartController.changeProductCount);
user_route.post("/delete-Cart-product",cartController.deleteCartProduct)
user_route.get('/checkout-page',cartController.loadChekout)
user_route.get('/filter-category/:id',userController.filterCategory)




user_route.get('/add-address',Auth.isLogin,addressController.loadAddAddress)
user_route.post('/add-address',Auth.isLogin,addressController.  insertAddress )
user_route.get('/edit-address',Auth.isLogin,addressController. loadEditAddress  )
user_route.post('/update-address',Auth.isLogin,addressController. updateAddress  )
user_route.post('/delete-address',addressController. deleteAddress  )



user_route.post('/checkout-page',orderController. placeOrder)
user_route.get('/my-orders',orderController. loadMyOrder)
user_route.post('/verify-payment',orderController. verifyPayment)
user_route.get('/single-order-page/:id',orderController.loadSingleOrder)
user_route.post('/cancel-order',orderController.orderCancel)
user_route.post('/order-success/:id',orderController.loadOrderSuccess)


user_route.post('/apply-coupon',couponController.applyCoupen)


module.exports=user_route;