const mongoose = require("mongoose");

const banner=mongoose.Schema({

banner_img:{
    type:String,
     required:true
},

banner_img2:{
    type:String,
    //  required:true
},
first_text2:{
    type:String,
    required:true
},
main_text2:{

    type:String,
    required:true
},
button_effect:{

    type:String,
    // required:true
},
first_text:{

    type:String,
    required:true
},
main_text:{

    type:String,
    required:true
},
button_text:{

    type:String,
    // required:true
},
is_delete:{
    type:Boolean,
    default:false,
}

});

module.exports=mongoose.model("Banner",banner);
