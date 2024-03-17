import express from "express";
import {registerController,loginController,testController, forgotPasswordController, updateProfileController, getOrderController, getAllOrderController, orderStatusController} from '../controller/authController.js'
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";
//router object
const router=express.Router();
router.post('/register',registerController);
router.post('/login',loginController)
router.post('/forgot-password',forgotPasswordController)
router.get('/test',requireSignIn,isAdmin,testController)
router.get('/user-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
})
router.get('/admin-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
})
//update profile
router.put('/profile',requireSignIn,updateProfileController)
router.get('/orders',requireSignIn,getOrderController)
router.get('/all-orders',requireSignIn,getAllOrderController)
router.put('/order-status/:orderId',requireSignIn,isAdmin,orderStatusController)
export default router;
