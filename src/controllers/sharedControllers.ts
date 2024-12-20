import { NextFunction, Response } from "express-serve-static-core"
import { ExtendRequest } from "../middlewares/authentication"
import { CatchAsyncError } from "../middlewares/errorsHandler"
import { ISharedControllers as IControllers} from "."
import { ApiError } from "../utils/ApiErrors"
import { editSellerAccountDB, fetchSellerProfileDB, fetchSellersChunkDB } from "../services/sharedServices"

export const fetchSellersChunk = 
CatchAsyncError( async (req: ExtendRequest, res: Response ,next:NextFunction)=>{
  console.log("--> fetch sellers chunk request")
  let { name , curPage , perPage , sortBy } = req.query as unknown as  IControllers.fetchSellersChunk
  sortBy = sortBy ? sortBy : []
  let excluded = ["searchValue","perPage","curPage","sortBy"]
  let mutatedQuery = {...req.query}
  excluded.forEach(param=> delete mutatedQuery[param])
  let queryString = JSON.stringify(mutatedQuery) ; 
  queryString = queryString.replace(/\b(lt|lte|gte|gt)\b/g,match => `$${match}`)
  mutatedQuery = JSON.parse(queryString)
  const query: any = { ...mutatedQuery }
  if (name) query.name = { $regex: new RegExp(name, "i") }
  const result = await fetchSellersChunkDB({query,curPage,perPage,sortBy})
  if(!result)
    return next( new ApiError("fetch sellers chunk request failed",400))
  const {statusCode, sellers ,pagesLen} = result
  console.log("<-- fetch sellers chunk response")
  return res.status(statusCode).json({sellers,pagesLen,message:"sellers chunk fetch succeeded"})
})

export const editSellerAccount = CatchAsyncError( 
  async (req:ExtendRequest,res:Response,next:NextFunction)=>{
    console.log("--> edit seller account request")
    const  {sellerId , status } = req.body 
    const result = await editSellerAccountDB({sellerId , status})
    if(!result)
      return next( new ApiError("edit seller account request failed",400))
    const { statusCode , message } = result
    console.log("<-- edit seller account response")
    return res.status(statusCode).json({message})
  })

export const fetchSellerProfile = CatchAsyncError( 
async (req:ExtendRequest,res:Response,next:NextFunction)=>{
  console.log("--> fetch seller profile request")
  let  sellerId  = req.query.sellerId as string
  const result = await fetchSellerProfileDB({sellerId},next)
  if(!result)
    return next( new ApiError("fetch seller profile process failed",400))
  const { statusCode , seller } = result
  console.log("<-- fetch seller profile response")
  return res.status(statusCode).json({seller,message:"profile fetch succeeded"})
})
