import express from 'express';
import { addProduct, fetchProduct, fetchProductsChunk } from '../controllers/productControllers';
import { auth } from '../middlewares/authentication';
import { fetchCategoriesChunk } from '../controllers/categoryControllers';
const productRoute = express.Router();

productRoute.route('/')
.all((req,res,next)=>{
  console.log("product route")
  next();
  })
  .post(auth,addProduct)
  .get(auth,fetchProduct)
productRoute.route('/chunk')
  .all((req,res,next)=>{
    console.log("product route")
    next();
    })
    .get(auth,fetchProductsChunk)
export default productRoute