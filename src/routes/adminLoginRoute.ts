import express from 'express';
import { adminLogin, getAdmin } from '../controllers/adminLoginControllers';
import { requireAuth } from '../middlewares/authentication';
const adminLoginRoute = express.Router();
adminLoginRoute.route('/login')
.all((req,res,next)=>{
  console.log("admin login route")
  next();
})
  .post(adminLogin)
adminLoginRoute.route('/')
.all((req,res,next)=>{
  console.log("admin login route")
  next();
})
  .get(requireAuth)


export default adminLoginRoute