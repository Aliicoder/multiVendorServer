import express from 'express';
import { addCategory, fetchCategoriesChunk ,fetchCategoriesNames } from '../controllers/categoryControllers';
const categoryRoute = express.Router();
categoryRoute.route('/')
.all((req,res,next)=>{
  console.log("category route")
  next();
  })
  .post(addCategory)
  .get(fetchCategoriesNames)
categoryRoute.route('/chunk')
.all((req,res,next)=>{
  console.log("category route")
  next();
  })
  .get(fetchCategoriesChunk)
export default categoryRoute