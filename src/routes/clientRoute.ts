import express from 'express';
import { addAddress, clientLogin, clientLogout, clientSignup, deleteAddress, updateAddress } from '../controllers/clientControllers';
import { authClient } from '../middlewares/authentication';
import { fetchSellersChunk } from '../controllers/sharedControllers';
const clientRoute = express.Router();
clientRoute.route('/signup')
  .post(clientSignup)
  
clientRoute.route('/login')
  .post(clientLogin)

clientRoute.route('/logout')
  .patch(authClient,clientLogout)
  
clientRoute.route("/address")
  .post(authClient,addAddress)
  .patch(authClient,updateAddress)
  .delete(authClient,deleteAddress)

clientRoute.route('/shopsChunk')
  .get(fetchSellersChunk)
export default clientRoute