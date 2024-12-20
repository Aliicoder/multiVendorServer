import Admin from "../models/Admin"
import bcrypt from 'bcrypt'
import { genRefreshToken, genAccessToken } from "../middlewares/authentication"
import { NextFunction } from "express"
import { ApiError } from "../utils/ApiErrors"
import Product from "../models/Product"
import Order from "../models/Order"
import { IAdminServices as IServices  } from "."
export const adminLoginDB = async ({email,password}:IServices.adminsParams,
  next:NextFunction
) =>{
  const admin = await Admin.findOne({email}).select("+password")
  if(!admin)
    return next( new ApiError("Admin not found",400))
  const isValidPassword = await bcrypt.compare(password,admin.password)
  if(!isValidPassword)
    return next( new ApiError("Invalid email or password",400))
  const accessToken = await genAccessToken({id:admin._id,email,time:"1m"})
  const refreshToken = await genRefreshToken({id:admin._id,email,time:"30d"})
  admin.refreshToken = refreshToken
  await admin.save()
  const user = {
    userId:admin._id,
    name:admin.name,
    avatar : admin.avatar , 
    roles:admin.roles,
    accessToken
  }
  return { statusCode : 200, user , refreshToken }
}

export const fetchAdminDashboardDataDB = async () =>{
  const noOfOrders = await Order.find().countDocuments();
  const noOfPendingOrders = await Order.find({status:"pending"}).countDocuments();
  const noOfProducts = await Product.find().countDocuments();
  return { statusCode:200, statistics: {
    noOfOrders,
    noOfPendingOrders,
    noOfProducts
  }}
}
