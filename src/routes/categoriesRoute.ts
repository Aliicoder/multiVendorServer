import express from 'express';
import { addCategory, deleteCategory, fetchCategories, fetchCategoriesChunk ,fetchCategoriesNames, fetchSellerCategories } from '../controllers/categoryControllers';
import { authSeller } from '../middlewares/authentication';
const categoryRoute = express.Router();


categoryRoute.route('/chunk')
  .get(fetchCategoriesChunk)

categoryRoute.route('seller/chunk')
  .get(authSeller,fetchCategoriesChunk)

categoryRoute.route('/fetchCategories')
  .get(fetchCategories)

categoryRoute.route('/sellerCategories')
  .get(authSeller,fetchSellerCategories)
categoryRoute.route('/seller')
  .post(authSeller,addCategory)
  .get(authSeller,fetchCategoriesNames)
  .delete(authSeller,deleteCategory)



export default categoryRoute