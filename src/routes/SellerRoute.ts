import express from 'express';
import { fetchSellerDashboardData, sellerLogin, sellerSignup} from '../controllers/sellerControllers';
import { authSeller } from '../middlewares/authentication';
const sellerRoute = express.Router();
sellerRoute.route('/signup')
  .post(sellerSignup)

sellerRoute.route('/login')
  .post(sellerLogin)

sellerRoute.route('/profile')
  //.get(authSeller,fetchSellerProfile)
  
sellerRoute.route('/generalInfo')
  //.post(authSeller,setGeneralInfo)

sellerRoute.route('/businessInfo')
  //.post(authSeller,setBusinessInfo)

sellerRoute.route('/dashboard')
    .get(authSeller,fetchSellerDashboardData)

export default sellerRoute