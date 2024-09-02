import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { genRefreshToken, genToken } from "../middlewares/authentication"
import Seller from "../models/Seller"
import Business from '../models/Business'
import mongoose from 'mongoose'
interface SignupParams {
    name: string
    businessName: string
    email:string
    password:string
}
export const sellerSignupDB = async ({name,businessName,email,password}:SignupParams) =>{
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const seller = await Seller.findOne({email}).select("+password")
    if(seller){
      await session.abortTransaction();
      session.endSession();
      return { statusCode : 403, error : "your already signed up" }
    }
    const business = await Business.findOne({businessName})
    if(business){
      await session.abortTransaction();
      return { statusCode : 403, error : "business name already exist" }
    }
    const newBusiness = await Business.create([{businessName}],{session})
    const hashedPassword = await bcrypt.hash(password,10)
    const newSeller = await Seller.create([{name,businessName,email,password:hashedPassword,businessInformation:newBusiness[0]._id}],{session})
    const accessToken = await genToken({id:newSeller[0]._id,roles:newSeller[0].roles,time:"1m"})
    const refreshToken = await genToken({id:newSeller[0]._id,roles:newSeller[0].roles,time:"30d"})
    newSeller[0].refreshToken = refreshToken
    await newSeller[0].save({session})
    await session.commitTransaction()
    session.endSession()
    const data = {
      user:{
        name:newSeller[0].name,
        avatar:newSeller[0].avatar,
        roles:newSeller[0].roles
      },
      accessToken
    }
    return { statusCode : 200, data , refreshToken }
  } catch (error) {
    console.error(error)
    await session.abortTransaction();
    session.endSession();
    return { statusCode : 500 , error : "something went wrong" }
  }
}
interface LoginParams {
  email:string
  password:string
}
export const sellerLoginDB = async ({email, password}:LoginParams)=>{
  try {
    const seller = await Seller.findOne({email}).select("+password")
    if(!seller)
      return { statusCode : 404, error : "sign up first" }
    const isValidPassword = await bcrypt.compare(password,seller.password)
    if(!isValidPassword)
      return { statusCode : 403, error : "invalid credentials"}
    const token = await genToken({id:seller._id,roles:seller.roles,time:"1m"})
    const refreshToken = await genRefreshToken({id:seller._id,roles:seller.roles,time:"30d"})
    seller.refreshToken = refreshToken
    await seller.save()
    const data = {
      user:{
        name:seller.name,
        avatar:seller.avatar,
        roles:seller.roles
      },
      token
    }
    return { statusCode : 200, data , refreshToken }
  } catch (error) {
    console.error(error)
    return { statusCode : 500 , error : "something went wrong" }
  }
}