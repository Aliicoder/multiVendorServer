import express from 'express';
import { adminLogin ,fetchAdminDashboardData } from '../controllers/adminControllers';
import { authAdmin } from '../middlewares/authentication';
import { fetchSellersChunk ,editSellerAccount, fetchSellerProfile } from '../controllers/sharedControllers';
const adminRoute = express.Router();
adminRoute.route('/login')
.all((req,res,next)=>{
  console.log("admin route")
  next();
})
  .post(adminLogin)
adminRoute.route('/seller')
  .patch(authAdmin,editSellerAccount)
  .get(authAdmin,fetchSellerProfile)

adminRoute.route('/chunk')
  .get(authAdmin,fetchSellersChunk)

adminRoute.route('/dashboard')
  .get(authAdmin,fetchAdminDashboardData)


export default adminRoute