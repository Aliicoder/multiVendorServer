import express from 'express';
import { addProduct, deleteProduct, editProduct, fetchFeaturedProducts, fetchFilterProducts, fetchProduct, fetchProductsChunk, fetchSearchedProducts } from '../controllers/productControllers';
import { authSeller } from '../middlewares/authentication';
const productRoute = express.Router();

productRoute.route('/filteredProducts')
  .get(fetchFilterProducts)
productRoute.route('/featuredProducts')
  .get(fetchFeaturedProducts)
productRoute.route('/search')
  .get(fetchSearchedProducts)
productRoute.route('/chunk')
  .get(fetchProductsChunk)
productRoute.route('/seller/chunk')
  .get(authSeller,fetchProductsChunk)
productRoute.route('/')
  .post(authSeller,addProduct)
productRoute.route('/:productId')
  .get(fetchProduct)
  .patch(authSeller,editProduct)
  .delete(authSeller,deleteProduct)
  
export default productRoute