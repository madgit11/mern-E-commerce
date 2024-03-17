import express from 'express';
import { isAdmin, requireSignIn } from '../middleware/authMiddleware.js';
import { categoryController, createCategoryController, deleteCategoryController, singleCategoryController, updateCategoryController } from '../controller/categoryController.js';
const router=express.Router();
router.post('/create-category',requireSignIn,isAdmin, createCategoryController)
//update category
router.put('/update-category/:id',requireSignIn, updateCategoryController)
router.get('/get-category',categoryController)
router.get('/single-category/:slug',singleCategoryController)
router.delete('/delete-category/:id',requireSignIn,isAdmin,deleteCategoryController)
export default router