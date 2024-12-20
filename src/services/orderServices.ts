import Product  from "../models/Product";
import Order, { IOrder } from "../models/Order";
import { fetchVideos, IFetchOrders } from "../controllers/orderController";
import { NextFunction } from "express";

interface IFetchOrdersDB extends IFetchOrders  {
  clientId : string
}
export const fetchOrdersDB = async ({clientId}:IFetchOrdersDB) =>{
  const orders : IOrder[] | null = await Order.find({clientId}).populate({
    path:"units.productId",
    model:Product
  })
  return { statusCode : 200 , orders }
}

export const fetchSellerOrdersDB = async ({searchValue,curPage,perPage,status}:fetchVideos) => {
  const query = searchValue ? {name:{ $regex: new RegExp(searchValue, 'i') },status} : {status} ; 
  const ordersLen = await Order.countDocuments(query); 
  const pagesLen = Math.ceil(ordersLen / perPage);
  const skip = ( curPage - 1 ) * perPage ; 
  const orders = await Order.find(query).skip(skip).limit(perPage)
  return { statusCode : 200, orders , pagesLen}
}



