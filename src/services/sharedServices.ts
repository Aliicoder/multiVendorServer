import Seller from "../models/Seller";
import {ISharedServices as IServices} from "."
import { ApiError } from "../utils/ApiErrors";
import { NextFunction } from "express";
export const fetchSellersChunkDB = async ({query,curPage,perPage,sortBy}:IServices.fetchSellersChunkDB) =>{
  const productsLen = await Seller.countDocuments(query) ; 
  const pagesLen = Math.ceil(productsLen / perPage)
  const skip = ( curPage - 1 ) * perPage 
  const sellers = await Seller.find(query).skip(skip).limit(perPage).sort(sortBy)
  return { statusCode : 200, sellers , pagesLen}
}

export const editSellerAccountDB = async ({sellerId,status}:IServices.editSellerAccountDB) =>{
  await Seller.findOneAndUpdate({_id:sellerId},{status})
  return { statusCode : 200, message: "status updated" }
}

export const fetchSellerProfileDB = async ({sellerId}:IServices.fetchSellerProfileDB,next:NextFunction) =>{
  const seller = await Seller.findById(sellerId)
  if(!seller)
    return next( new ApiError("seller not found",400))
  return { statusCode : 200, seller }
}
