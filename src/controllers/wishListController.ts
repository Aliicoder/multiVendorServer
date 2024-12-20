import { NextFunction, Response } from "express-serve-static-core"
import { ExtendRequest } from "../middlewares/authentication"
import { getWishListDB,addProductToWishListDB, deleteProductFromWishListDB, fetchWishListDB } from "../services/wishListServices";
import { CatchAsyncError } from "../middlewares/errorsHandler";
import { ApiError } from "../utils/ApiErrors";
export const fetchWishList = CatchAsyncError(
async (req:ExtendRequest,res:Response,next:NextFunction)=>{
  console.log("--> fetch WishList request")
  const clientId = req.user._id 
  const result = await fetchWishListDB({clientId},next) 
  if(!result)
    return next( new ApiError("fetch wishList request failed",400))
  const {statusCode, wishList  } = result ;
  console.log("<-- fetch wishList response")
  return res.status(statusCode).json({wishList,message:"fetch wishList request succeeded"})
})
export const addProductToWishList = CatchAsyncError( 
async (req: ExtendRequest, res: Response,next:NextFunction)=>{
  console.log("--> add product to WishList request")
  const clientId = req.user._id
  const productId = req.body.productId as string 
  const result = await addProductToWishListDB({clientId,productId},next);
  if(!result)
    return next( new ApiError("add product to wishList request failed",400))
  const {statusCode } = result 
  console.log("<-- add product to WishList response")
  return res.status(statusCode).json({message:"add product to wishList request succeeded"})
})
export const deleteProductFromWishList = CatchAsyncError(
async (req: ExtendRequest, res: Response,next:NextFunction)=>{
  console.log("--> delete product from WishList request")
  const clientId = req.user._id
  const productId = req.body.productId as string 
  const result = await deleteProductFromWishListDB({clientId,productId},next);
  if(!result)
    return next( new ApiError("delete product from wishList request failed",400))
  const {statusCode } = result 
  console.log("<-- delete product from WishList response")
  return res.status(statusCode).json({message:"delete product from wishList request succeeded"})
})
