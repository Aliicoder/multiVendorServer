import jwt from "jsonwebtoken";
import { Request , Response ,NextFunction } from "express"
import Seller from "../models/Seller";
import { genAccessToken } from "./authentication";
import Admin from "../models/Admin";
import Client, { IClient } from "../models/Client";
import { CatchAsyncError } from "./errorsHandler";
import { ApiError } from "../utils/ApiErrors";


export const refreshAdmin = CatchAsyncError( 
async (req:Request,res:Response,next:NextFunction) =>{
  console.log("--> refresh admin request")
  const refreshToken = req.cookies.adminToken
  if(!refreshToken)
    return next( new ApiError (`refresh token is required`,400))
  jwt.verify(refreshToken,process?.env?.REFRESH_TOKEN_SECRET!,
    async (error:any,payload:any)=> {
      if(error)
        return next( new ApiError (`invalid refresh token`,400))
      if(!payload)
        return next( new ApiError (`payLoad is required`,400))
      const {id,roles} = payload as { id:string , roles : number[]};console.log("client id >>",id)
      let refreshedAdmin = await Admin.findById(id); console.log("client >>",refreshedAdmin);
      if(!refreshedAdmin) 
        return next( new ApiError (`unauthorized access is required`,403)) 
      const accessToken = await genAccessToken({id:refreshedAdmin._id,email:refreshedAdmin.email,time:"1m"})
      const user = {
        userId:refreshedAdmin._id,
        name:refreshedAdmin.name,
        avatar:refreshedAdmin.avatar,
        roles:refreshedAdmin.roles,
        accessToken
      }
      console.log("<-- refresh admin response")
      return res.status(200).json({user,message:"welcome back"})
  })
})

export const refreshSeller = CatchAsyncError( 
async (req:Request,res:Response,next:NextFunction) =>{
  console.log("--> refresh seller request")
  const refreshToken = req.cookies.sellerToken; 
  if(!refreshToken)
    return next( new ApiError (`refresh token is required`,400))
  jwt.verify(refreshToken,process?.env?.REFRESH_TOKEN_SECRET!,
    async (error:any,payload:any)=> {
      if(error)
        return next( new ApiError (`invalid refresh token`,400))
      if(!payload)
        return next( new ApiError (`payLoad is required`,400))
      const _id = payload.id as string 
      let refreshedSeller = await Seller.findById({_id,refreshToken})
      if(!refreshedSeller) 
        return next( new ApiError (`unauthorized access is required`,403)) 
      const accessToken = await genAccessToken({id:refreshedSeller._id,email:refreshedSeller.email,time:"1m"})
      const user = {
        userId:refreshedSeller._id,
        name:refreshedSeller.name,
        businessName:refreshedSeller.businessName,
        avatar:refreshedSeller.avatar,
        roles:refreshedSeller.roles,
        locations:refreshedSeller.businessId.locations,
        accessToken
      } 
      console.log("<-- refresh seller response")
      return res.status(200).json({user,message:"welcome back"})
  })
})


export const refreshClient =  CatchAsyncError ( 
async (req:Request,res:Response,next:NextFunction) => { 
  console.log("--> refresh client request")    
  const refreshToken = req.cookies.clientToken; 
  if(!refreshToken)
    return next( new ApiError (`refresh token is required`,400))
  jwt.verify(refreshToken,process?.env?.REFRESH_TOKEN_SECRET!,
    async (err:any,payload:any)=> {
      if(err)
        return next( new ApiError (`invalid refresh token`,400))
      if(!payload)
        return next( new ApiError (`payLoad is required`,400))
      const {id,roles} = payload as { id:string , roles : number[]}
      let refreshedClient:IClient | null = await Client.findById(id)
      if(!refreshedClient) 
        return next( new ApiError (`unauthorized access is required`,403)) 
      let stringifiedId = refreshedClient._id as string
      const accessToken = await genAccessToken({id:stringifiedId,email:refreshedClient.email,time:"1m"})
      const user = {
        userId:refreshedClient._id,
        name:refreshedClient.name,
        roles:refreshedClient.roles,
        addresses:refreshedClient.addresses,
        accessToken
      } 
      console.log("<-- refresh client response")    
      return res.status(200).json({user,message:"welcome back"})
  })
})









