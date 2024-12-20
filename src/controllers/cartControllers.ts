import { NextFunction, Response } from "express-serve-static-core"
import { addProductToCartDB,cashOnDeliveryPaymentDB,deleteProductFromCartDB,getUserPopulatedActiveCartDB} from "../services/cartServices"
import { ExtendRequest } from "../middlewares/authentication"
import { CatchAsyncError } from "../middlewares/errorsHandler";
import { ApiError } from "../utils/ApiErrors";
import { IAddress } from "../models";
import { ICart } from "../models/Cart";
export const getUserActiveCart = CatchAsyncError ( 
async (req:ExtendRequest,res:Response,next:NextFunction)=>{
  console.log("--> get active cart request")
  const clientId = req.user._id 
  const result = await getUserPopulatedActiveCartDB({clientId},next) 
  if(!result)
    return next( new ApiError("getting active cart request failed",400))
  const {statusCode, cart } = result
  console.log("<-- get active cart response")
  return res.status(statusCode).json({cart,message:"getting active cart succeeded"})
})

export const addProductToCart = CatchAsyncError( 
async (req: ExtendRequest, res: Response , next:NextFunction)=>{
  console.log("--> add product to cart request")
  const clientId = req.user._id
  let  productId  = req.body.productId as string
  const result = await addProductToCartDB({clientId,productId},next)
  if(!result)
    return next( new ApiError("adding product to cart request failed",400))
  const { statusCode,cart } = result
  console.log("<-- add product to cart response")
  return res.status(statusCode).json({cart ,message:"adding product request succeeded"})
})

export const deleteProductFromCart = CatchAsyncError(
async (req: ExtendRequest, res: Response,next:NextFunction)=>{
  console.log("--> delete product from cart request")
  const clientId = req.user._id
  let  productId  = req.body.productId as string
  const result = await deleteProductFromCartDB({clientId,productId},next);
  if(!result)
    return next( new ApiError("delete product from cart request failed",400))
  const { statusCode ,cart } = result
  console.log("<-- delete product from cart response")
  return res.status(statusCode).json({cart,message:"deleting product from cart request succeeded"})
})
export interface ICashOnDeliveryPayment {
  activeCart: ICart
  address: IAddress
}
export const cashOnDeliveryPayment = CatchAsyncError(
async (req: ExtendRequest, res: Response, next:NextFunction)=>{
  console.log("--> cash on delivery request")
  const clientId = req.user._id
  const { activeCart , address } = req.body as ICashOnDeliveryPayment
  console.log("req.body >>",req.body)
  const result = await cashOnDeliveryPaymentDB({clientId,activeCart,address},next);
  if(!result)
    return next( new ApiError("cash of delivery request failed",400))
  const { statusCode  } = result
  console.log("<-- cash on delivery response")
  return res.status(statusCode).json({message:"order place succeeded"})
})
