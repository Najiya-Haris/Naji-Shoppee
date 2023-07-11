const wishlist=require("../Models/wishistModel")
const User=require("../Models/userModel")
const Product=require("../Models/productModel")

// Load wishlist

const loadwishlist = async (req, res) => {
    try {
      const session = req.session.user_id;
      const wishlistData = await wishlist.find({ userId: session }).populate('products.productId');
      if (wishlistData.length > 0) {
        const wishlist = wishlistData[0].products;
        const products = wishlist.map(wish => wish.productId);
        res.render('wishlist', { session, wishlist, products });
      } else {
        res.render('wishlist', { session, wishlist: [], products: [] });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  // Add to wishlist


const addToWishlist = async (req, res) => {
    try {
        
      const id = req.body.proId;
      const user = req.session.user_id
      const userData = await User.findById(user)
      const wishlistData = await wishlist.findOne({ userId:user });
      console.log(wishlistData);
 
  
      if (wishlistData) {
        const checkWishlist = await wishlistData.products.findIndex((wish) => wish.productId == id);
  
  
        if (checkWishlist != -1) {
          res.json({ check: true });
        } else {
          await wishlist.updateOne({ userId: req.session.user_id }, { $push: { products: { productId: id } } });
          res.json({ success: true });
        }
      } else {
        const Wishlist = new wishlist({
          userId: req.session.user_id,
          userName: userData.name, 
          products: [
            {
              productId: id,
            },
          ],
        });
  
        const wish = await Wishlist.save();
        if (wish) {
          res.json({ success: true });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  //delete from wishlist


const deleteWishlist = async (req, res) => {
    try {
      const id = req.query.id;
      const user_id = req.session.user_id;
      const updatedWishlist = await wishlist.findOneAndUpdate(
        {userId:user_id},
        { $pull: { products: { productId: id } } }
      );
      res.redirect('/wishlist');
    } catch (error) {
      console.log(error.message);
    
    }
  };

module.exports={
    loadwishlist,
    addToWishlist,
    deleteWishlist
}