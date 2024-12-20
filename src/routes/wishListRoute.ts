import express from 'express';
import { authClient } from '../middlewares/authentication';
import { addProductToWishList, deleteProductFromWishList, fetchWishList } from '../controllers/wishListController';
const wishListRoute = express.Router();
wishListRoute.route('/')
  .get(authClient,fetchWishList)
  .post(authClient,addProductToWishList)
  .delete(authClient,deleteProductFromWishList);
export default wishListRoute