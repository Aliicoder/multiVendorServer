import express from 'express';
import {  authClient, authSeller } from '../middlewares/authentication';
import { fetchOrders, fetchSellerOrders } from '../controllers/orderController';
const orderRoute = express.Router();
orderRoute.route('/')
  .get(authClient,fetchOrders)
orderRoute.route('/seller')
  .get(authSeller,fetchSellerOrders)

export default orderRoute