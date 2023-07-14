const dotenv = require("dotenv")
dotenv.config()
const express=require("express")
const session = require("express-session")
const mongoose=require("mongoose")
mongoose.connect(process.env.mongo);
const morgan = require('morgan')
const nocache = require('nocache')

const app=express()
const path=require('path')
app.set('view engine','ejs')
app.set('views','./views/user')

app.use(express.static(path.join(__dirname,'public')))

app.use(nocache());

// app.use(morgan('tiny'))
app.use(
    session({
      secret: process.env.sessionSecret,
      saveUninitialized: true,
      resave: false,
      cookie: {
        maxAge: 604800000,
      },
    })
  );

const userRoute=require('./routes/userRoute')
app.use('/',userRoute)

const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute)

app.use((err,req,res,next) => {
console.error(err)
res.status(500).send("internal server error")
})

app.use((req,res,next)=>{
  console.log('404 error');
  res.render('error')
})

app.listen(process.env.port,function(){
    console.log("Server running 5000");
})