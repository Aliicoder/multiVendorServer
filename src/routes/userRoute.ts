import express from 'express';
import { login, logout, signup } from '../controllers/userControllers';
import { validateTokenAndAuthorizeUser } from '../middlewares/authentication';
const userRoute = express.Router();

userRoute.route('/login')
.all((req,res,next)=>{
  console.log("login route")
  next();
})
  .post(login)
userRoute.route('/signup')
  .post(signup)
userRoute.route('/logout')
  .put(validateTokenAndAuthorizeUser([2001]),logout)
export default userRoute