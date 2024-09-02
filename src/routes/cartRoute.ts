import express from 'express';
import { validateTokenAndAuthorizeUser } from '../middlewares/authentication';
import { addUnitIntoActiveCart, checkOut, deleteAllUnits, deleteOneUnitFromCart, getUserActiveCart, updateUserCart } from '../controllers/cartControllers';
const cartRouter = express.Router();
cartRouter.route('/')
.all((req,res,next)=>{
  console.log("cart route")
  next();
})
  .get(validateTokenAndAuthorizeUser([2001]),getUserActiveCart)
  .post(validateTokenAndAuthorizeUser([2001]),addUnitIntoActiveCart)
  .delete(validateTokenAndAuthorizeUser([2001]),deleteAllUnits);

cartRouter.route('/checkout')
.all((req,res,next)=>{
  console.log("cart route")
  next();
})
 .put(validateTokenAndAuthorizeUser([2001]),checkOut)
export default cartRouter