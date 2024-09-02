import jwt from "jsonwebtoken";
import { Request , Response } from "express"
import Seller from "../models/Seller";
import { genToken } from "./authentication";
import Admin from "../models/Admin";
export const refreshSeller = async (req:Request,res:Response) =>{
  try {
    const refreshToken = req.cookies.refreshToken
    console.log(req.cookies.refreshToken)
    if(!refreshToken)
      return res.status(401).json({error:"token is required"})
    jwt.verify(refreshToken,process?.env?.REFRESH_TOKEN_SECRET!,
      async (err:any,payload:any)=> {
        if(err){
          //console.log(err)
          return res.status(403).json({error:"Invalid refresh token"})
        } 
        if(!payload){
          //console.log(payload)
          return res.status(403).json({error:"payload is required"})
        }
        const { roles } = payload as { roles : number[]}
        console.log(payload)
        const admin = await Seller.findOne({refreshToken})
        if(!admin) 
          return res.status(404).json({error:"admin not found"}) 
        console.log(admin)
        const isAllowed = admin.roles.includes(roles[0])
        if(!isAllowed)
          return res.status(403).json({error:"Invalid payload"})
        const token = await genToken({id:admin._id,roles:admin.roles,time:"1m"})
        const credentials = {
          user:{
            name:admin.name,
            avatar:admin.avatar,
            roles:admin.roles
          },
          token
        }
        return res.status(200).json({credentials,message:"welcome back"})
    })
  } catch (e:any) {
    return { statusCode : 500 , error : " something went wrong :\n"+e.message}
  }
}
export const refresh = async (req:Request,res:Response) =>{
  try {
    const refreshToken = req.cookies.refreshToken
    console.log(req.cookies.refreshToken)
    if(!refreshToken)
      return res.status(401).json({error:"token is required"})
    jwt.verify(refreshToken,process?.env?.REFRESH_TOKEN_SECRET!,
      async (err:any,payload:any)=> {
        if(err){
          //console.log(err)
          return res.status(403).json({error:"Invalid refresh token"})
        } 
        if(!payload){
          //console.log(payload)
          return res.status(403).json({error:"payload is required"})
        }
        const { roles } = payload as { roles : number[]}
        let refreshedUser;
        if(roles.includes(1999))
          refreshedUser = await Admin.findOne({refreshToken})
        if(roles.includes(2000))
          refreshedUser = await Seller.findOne({refreshToken})
        if(!refreshedUser) 
          return res.status(404).json({error:"admin not found"}) 
        console.log(refreshedUser)
        const token = await genToken({id:refreshedUser._id,roles:refreshedUser.roles,time:"1m"})
        const credentials = {
          user:{
            name:refreshedUser.name,
            avatar:refreshedUser.avatar,
            roles:refreshedUser.roles
          },
          token
        }
        return res.status(200).json({credentials,message:"welcome back"})
    })
  } catch (e:any) {
    return { statusCode : 500 , error : " something went wrong :\n"+e.message}
  }
}