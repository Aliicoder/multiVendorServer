import express from 'express';
import { sellerLogin, sellerSignup } from '../controllers/sellerControllers';
const sellerRoute = express.Router();
sellerRoute.route('/signup')
.all((req,res,next)=>{
  console.log("seller route")
  next();
})
.post(sellerSignup)
sellerRoute.route('/login')
.all((req,res,next)=>{
  console.log("seller route")
  next();
})
  .post(sellerLogin)

export default sellerRoute