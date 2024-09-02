import express from 'express';
import { refresh, refreshSeller } from '../middlewares/refreshes';
const refreshSellerRoute = express.Router()
const refreshAdminRoute = express.Router()
refreshSellerRoute.route("/")
.all((req,res,next)=>{
  console.log("refresh route")
  next();
})
  .get(refresh)
refreshAdminRoute.route("/")
  .all((req,res,next)=>{
    console.log("refresh route")
    next();
  })
  .get(refreshSeller)
export default refreshSellerRoute