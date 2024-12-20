import express from 'express';
import { authClient } from '../middlewares/authentication';
import { 
  cashOnDeliveryPayment, 
  getUserActiveCart,
  addProductToCart,
  deleteProductFromCart } from '../controllers/cartControllers';
  
const cartRouter = express.Router();
cartRouter.route('/')
  .get(authClient,getUserActiveCart)
 
cartRouter.route('/deleteAndFetch')
  .delete(authClient,deleteProductFromCart)

cartRouter.route('/addAndFetch')
  .post(authClient,addProductToCart)

cartRouter.route('/cashOnDeliveryPayment')
 .post(authClient,cashOnDeliveryPayment)

export default cartRouter






 //.post(authAndAuthorization("CLIENT"),addUnitIntoActiveCart)
  //.delete(authAndAuthorization("CLIENT"),deleteProductFromCart);
  //.delete(authAndAuthorization("CLIENT"),deleteAllUnits);