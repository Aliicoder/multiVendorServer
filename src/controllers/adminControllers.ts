import { NextFunction, Response } from "express-serve-static-core"
import { ExtendRequest } from "../middlewares/authentication"
import { adminLoginDB ,fetchAdminDashboardDataDB } from "../services/adminServices"
import { CatchAsyncError } from "../middlewares/errorsHandler"
import { ApiError } from "../utils/ApiErrors"
export const adminLogin = CatchAsyncError( 
async (req:ExtendRequest,res:Response ,next:NextFunction)=>{
  console.log("--> admin login request")
  const {email,password} = req.body
  const result = await adminLoginDB({email,password},next)
  if(!result)
    return next( new ApiError("login request failed",400))
  const { statusCode , user , refreshToken } = result
  res.cookie("clientToken",refreshToken,{
    expires: new Date(Date.now() + 30*24*60*60*1000),
    secure: process.env.MODE === "production",
    sameSite: process.env.MODE === "production" ? "none" : "lax",
    httpOnly: true
  })
  console.log("<-- admin login response")
  return res.status(statusCode).json({user,message:"login succeeded"})
})

export const fetchAdminDashboardData = CatchAsyncError( 
async (req: ExtendRequest, res: Response,next:NextFunction) =>{
  console.log("--> fetch admin dashboard chunk request")
  const result = await fetchAdminDashboardDataDB()
  if(!result)
    return next( new ApiError("fetch admin dashboard request failed",400))
  const {statusCode, statistics } = result
  console.log("<-- fetch admin dashboard chunk response")
  return res.status(statusCode).json({statistics,message:"statistics fetch succeeded"})
})
