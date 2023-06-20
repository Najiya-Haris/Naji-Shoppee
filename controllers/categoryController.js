const Category=require('../Models/categoryModel')
const bcrypt=require('bcrypt')
const session=require('express-session')
const User  =require('../Models/userModel');
const upperCase=require('upper-case')



let message=''






// ----------- category view section
const loadCategory = async (req, res) => {
  try {
    const adminData = await User.findById(req.session.auser_id);  
    const categoryData = await Category.find({is_delete:false});
    res.render('category', { admin: adminData, category: categoryData, message: message || '' });
  } catch (error) {
    console.log(error.message);
    res.render('category', { message: message || '' });
  }
};



// ---------- Category data storing section  
const insertCategory = async (req, res) => {
  try {
    const name = upperCase.upperCase(req.body.name.trim());
    const existingCategory = await Category.findOne({  categoryname: name });
    const reupdate = await Category.updateOne({  categoryname: name },{$set:{is_delete:false}});
    if (existingCategory) {
      message = 'category is already exists';
      res.redirect('/admin/category');
      return;
    }

    const category = new Category({
      categoryname: name,
    });

    const categoryData = await category.save();

    if (categoryData) {
      message = 'category is added';
      res.redirect('/admin/category');
    } else {
      message = 'Something went wrong';
      res.redirect('/admin/category');
    }
  } catch (error) {
    console.log(error.message);
    message = 'something went wrong';
    res.redirect('/admin/category');
  }
};

//  ------------- Edit category section
const editCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const adminData = await User.findById(req.session.auser_id);
    const categoryData = await Category.findById(id);
    if (categoryData) {
      res.render('category', {
        category: categoryData,
        admin: adminData,
        message: message || ''
      });
    } else {
      res.redirect('/admin/category');
    }
  } catch (error) {
    console.log(error.message);
  }
};




//  --------------- Update category section
const updateCategory = async (req, res) => {
  try {
    const id = req.body.id;
    const updatedCategoryName = upperCase.upperCase(req.body.categoryName.trim());
    const existingCategory = await Category.findOne({ categoryname: updatedCategoryName, _id: { $ne: id } });
    if (existingCategory) {
      message = 'category already exists';
      res.redirect('/admin/category');
      return;
    }
    const category = await Category.findByIdAndUpdate(id, { categoryname: updatedCategoryName });
    if (category) {
      message = 'category updated successfully';
      res.redirect('/admin/category');
    } else {
      message = 'failed to update category';
      res.redirect('/admin/category');
    }
  } catch (error) {
    console.log(error.message);
    message = 'something went wrong';
    res.redirect('/admin/category');
  }
};


//-------------- Delete category section

let deleteCategory = async (req, res) => {
  try {
    const id = req.query.id; // Use req.params.id to retrieve the category ID
    const category =   await Category.updateOne({ _id: id }, { $set: { is_delete: true } });
    res.redirect('/admin/category');
  } catch (error) {
    console.log(error.message);
  }
}




 module.exports={
    loadCategory,
   insertCategory,
   deleteCategory,
   updateCategory,
   editCategory

 }