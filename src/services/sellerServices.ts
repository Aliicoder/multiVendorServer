import bcrypt from 'bcrypt'
import { genRefreshToken, genAccessToken } from "../middlewares/authentication"
import Seller, { ISeller } from "../models/Seller"
import mongoose from 'mongoose'
import formidable from 'formidable'
import Product from '../models/Product'
import { NextFunction } from 'express-serve-static-core'
import { ApiError } from '../utils/ApiErrors'
import { putImageIntoS3Bucket } from '../utils/helpers'
import Order from '../models/Order'
interface SignupParams {
    name: string
    businessName: string
    email:string
    password:string
}
export const sellerSignupDB = async ({name,businessName,email,password}:SignupParams,next:NextFunction) =>{
  const session = await mongoose.startSession();
  session.startTransaction();

  const seller = await Seller.findOne({email}).select("+password")
  if(seller){
    await session.abortTransaction();
    session.endSession();
    return next( new ApiError("your already signed up",400))
  }

  const hashedPassword = await bcrypt.hash(password,10)
  const newSeller = await Seller.create([
    {name,email,password:hashedPassword,businessName}],
    {session})
  const accessToken = await genAccessToken({id:newSeller[0]._id,email,time:"1m"})
  const refreshToken = await genRefreshToken({id:newSeller[0]._id,email,time:"30d"})
  newSeller[0].refreshToken = refreshToken
  await newSeller[0].save({session})
  await session.commitTransaction()
  session.endSession()
  const user = {
    userId:newSeller[0]._id,
    name:newSeller[0].name,
    avatar:newSeller[0].avatar,
    roles:newSeller[0].roles,
    businessName,
    accessToken
  }
  return { statusCode : 200, user , refreshToken }
}
interface LoginParams {
  email:string
  password:string
}
export const sellerLoginDB = async ({email, password}:LoginParams,next:NextFunction)=>{
  const seller = await Seller.findOne({email}).select("+password") ; 
  if(!seller)
    return next( new ApiError("sign up first",400))
  const isValidPassword = await bcrypt.compare(password,seller.password)
  if(!isValidPassword)
    return next( new ApiError("invalid credentials",400))
  const accessToken = await genAccessToken({id:seller._id,email,time:"1m"})
  const refreshToken = await genRefreshToken({id:seller._id,email,time:"30d"})
  seller.refreshToken = refreshToken
  await seller.save()
  const user = {
    userId: seller._id,
    name:seller.name,
    avatar:seller.avatar,
    roles:seller.roles,
    accessToken,
    businessName:seller.businessName,
    locations:seller.businessId.locations
  }
  return { statusCode : 200, user , refreshToken }
}
interface FetchSellerProfileDB {
  businessId:string
}
// export const fetchSellerProfileDB = async ({businessId}:FetchSellerProfileDB)=>{
//     const businessInformation = await Business.findById(businessId)
//     return { statusCode : 200, businessInformation}
// }
interface SetGeneralInfoDB {
  seller: ISeller
  avatar:formidable.File
}
// export const setGeneralInfoDB = async ({seller,avatar}:SetGeneralInfoDB,next:NextFunction)=>{
//   const [,imageUrl] = await putImageIntoS3Bucket(avatar.filepath,"images",seller.businessName)
//   if(!imageUrl) 
//     return next( new ApiError("could`t upload the image",400))
//   seller.avatar = imageUrl
//   await seller.save();
//   return { statusCode : 200 }
// }
interface SetBusinessInfoDB {
  business_id: string
  state:string
  district:string
  subDistrict:string
}
// export const setBusinessInfoDB = async ({business_id,state,district,subDistrict}:SetBusinessInfoDB)=>{
//   await Business.findByIdAndUpdate({_id:business_id},{state,district,subDistrict});
//   return { statusCode : 200 }
// }
interface FetchSellersChunkDB {
  parsePerPage : number
  safeSearchValue : string
  parseCurPage : number
}

interface fetchSellerDashboardDataDB {
  sellerId: string
}
export const fetchSellerDashboardDataDB = async ({sellerId}:fetchSellerDashboardDataDB) =>{
  const noOfOrders = await Order.find({sellerId}).countDocuments();
  const noOfPendingOrders = await Order.find({sellerId,status:"pending"}).countDocuments();
  const noOfProducts = await Product.find({sellerId}).countDocuments();
  return { statusCode:200, statistics: {
    noOfOrders,
    noOfPendingOrders,
    noOfProducts
  }}
}