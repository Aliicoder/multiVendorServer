import { NextFunction, Response } from "express-serve-static-core"
import { ExtendRequest } from "../middlewares/authentication"
import { fetchOrdersDB, fetchSellerOrdersDB } from "../services/orderServices";
import { CatchAsyncError } from "../middlewares/errorsHandler";
import { ApiError } from "../utils/ApiErrors";

export const fetchOrders = CatchAsyncError(
async (req:ExtendRequest,res:Response,next:NextFunction)=>{
  console.log("fetch orders request")
  const clientId = req.user._id ; console.log("userId >>",clientId)
  const result = await fetchOrdersDB({clientId}) 
  if(!result)
    return next(new ApiError('fetch orders request failed', 400));
  const {statusCode, orders } = result
  console.log("fetch orders request")
  return res.status(statusCode).json({orders,message:"orders fetched succeeded",})
})

export const fetchSellerOrders = CatchAsyncError(
async (req:ExtendRequest, res:Response,next:NextFunction) => {
  console.log("seller orders fetch request")
  const { searchValue ,curPage ,perPage , status } = req.query as unknown as fetchVideos
  const result = await fetchSellerOrdersDB({ searchValue ,curPage ,perPage , status })
  if(!result)
    return next(new ApiError('seller orders fetch request failed', 400));
  const {statusCode,pagesLen,orders} = result
  console.log("<-- fetch orders response")
  return res.status(statusCode).json({orders,pagesLen,message:"seller orders fetch succeeded"})
})

export interface IFetchOrders {
  clientId: string
}

export interface fetchVideos {
  searchValue: string | ""
  curPage: number | 1
  perPage: number | 8
  status: "active" | "pending" | "settled"
}