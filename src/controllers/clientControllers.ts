import { NextFunction , Request , Response } from "express"
import { ExtendRequest } from "../middlewares/authentication"
import { addAddressDB,clientLoginDB, clientSignupDB, deleteAddressDB, updateAddressDB } from "../services/clientServices"
import { CatchAsyncError } from "../middlewares/errorsHandler";
import { ApiError } from "../utils/ApiErrors";
import { IAddress } from "../models";
import jwt from "jsonwebtoken";
import Client, { IClient } from "../models/Client";

export const clientSignup = CatchAsyncError( async (req:ExtendRequest,res:Response,next:NextFunction)=>{
  console.log("--> client signup request")
  const {name,email,password} = req.body ; 
  const result =  await clientSignupDB({name,email,password},next) 
  if (!result) 
    return next(new ApiError('Signup request failed', 400));
  const { statusCode, user, refreshToken } = result

  res.cookie("clientToken",refreshToken,{
    expires: new Date(Date.now() + 30*24*60*60*1000),
    secure: process.env.MODE === "production",
    sameSite: process.env.MODE === "production" ? "none" : "lax",
    httpOnly: true
  })
  console.log("<-- client signup response")
  return res.status(statusCode).json({user,message:"signup succeeded"})
})
export const clientLogin = CatchAsyncError ( 
async (req:ExtendRequest, res:Response,next:NextFunction) => {
  console.log("--> client login request")
  const {email,password} = req.body
  const result = await clientLoginDB({email,password},next)
  if(!result)
    return next(new ApiError('login request failed', 400));
  const {statusCode,user,refreshToken} = result 
  res.cookie("clientToken",refreshToken,{
    expires: new Date(Date.now() + 30*24*60*60*1000),
    secure: process.env.MODE === "production",
    sameSite: process.env.MODE === "production" ? "none" : "lax",
    httpOnly: true
  })
  console.log("<-- client login response")
  return res.status(statusCode).json({user,message:"login succeeded"})
})




export const clientLogout = 
CatchAsyncError( async (req:Request,res:Response,next:NextFunction) =>{
  console.log("--> client logout request")
  const refreshToken = req.cookies.clientToken; 
  res.clearCookie("clientToken",{
    httpOnly: true,
    sameSite: process.env.MODE == "production" ? "none" : "lax",
    secure: process.env.MODE == "production"
  })

  if(!refreshToken){
    console.log("--> No refresh token provided");
    return res.status(200).json({message:"logged out with ( token provided )"})
  }
  
  jwt.verify(refreshToken,process?.env?.REFRESH_TOKEN_SECRET!,
    async (error:any,payload:any)=> {

      if(error){ 
        console.log("-->invalid token provided");
        return res.status(403).json({error:"logged out ( invalid token provided )"})
      } 
      if(!payload){
        console.log("-->invalid payload provided");
        return res.status(200).json({message:"logged out ( invalid payload provided )"})
      }

      const { id,roles} = payload as { id:string , roles : number[]}
      console.log("refresh token: ", refreshToken)
      console.log("_id : ", id)

      let client : IClient | null = await Client.findOneAndUpdate({_id:id,refreshToken},{$set:{refreshToken:""}})
      console.log("client",client)
      if (!client) {
        console.log("--> Client not found or token mismatch");
        return res.status(200).json({ message: "Logged out successfully (client not found)" });
      }

      return res.status(200).json({message:"log out request succeeded"})
  })

})


export const addAddress = CatchAsyncError( 
async (req:ExtendRequest, res:Response , next:NextFunction) => {
  console.log("--> add address request")
  const clientId = req.user._id
  const {city,area,phone,pinCode,type,province} = req.body as IAddress ; 
  if(!city || !area || !phone || !pinCode || !type || !province )
    return next(new ApiError('invalid address submitted ', 400));
  const result  = await addAddressDB({clientId,city,area,phone,pinCode,type,province},next)
  if(!result)
    return next(new ApiError('add address request failed', 400));
  const {statusCode,addresses} = result
  console.log("<-- add address response")
  return res.status(statusCode).json({addresses,message:"address added succeeded"})
})
export const updateAddress = CatchAsyncError( 
async (req:ExtendRequest, res:Response , next:NextFunction) => {
  console.log("--> update address request")
  const clientId = req.user._id
  const addressId = req.body._id 
  const {city,area,phone,pinCode,type,province} = req.body as IAddress ; 
  console.log("req.body >>",req.body) 

  if(!city || !area || !phone || !pinCode || !type || !province )
    return next(new ApiError('invalid address submitted ', 400));
  const result  = await updateAddressDB({clientId,addressId,city,area,phone,pinCode,type,province},next)
  if(!result)
    return next(new ApiError('update address request failed', 400));
  const {statusCode,addresses} = result
  console.log("<-- update address response")
  return res.status(statusCode).json({addresses,message:"address update succeeded"})
})
export const deleteAddress = CatchAsyncError( 
async (req:ExtendRequest, res:Response , next:NextFunction) => {
  console.log("--> delete address request")
  const clientId = req.user._id
  const addressId = req.body.addressId as string ;
  console.log("req.body >>",req.body) 
  const result  = await deleteAddressDB({clientId,addressId},next)
  if(!result)
    return next(new ApiError('delete address request failed', 400));
  const {statusCode,addresses} = result
  console.log("<-- delete address response")
  return res.status(statusCode).json({addresses,message:"address delete succeeded"})
})


