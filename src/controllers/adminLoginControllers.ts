import { Response } from "express-serve-static-core"
import { ExtendRequest } from "../middlewares/authentication"
import { adminLoginDB } from "../services/adminServices"
export const adminLogin = async (req:ExtendRequest,res:Response)=>{
  const {email,password} = req.body
  const { statusCode , data , refreshToken , error } = await adminLoginDB({email,password})
  if(statusCode.toString().startsWith("4")|| statusCode.toString().startsWith("5"))
    return res.status(statusCode).json({message:error})
  res.cookie("refreshToken",refreshToken,{
    expires: new Date(Date.now() + 30*24*60*60*1000) 
  })
  res.status(statusCode).json({data,message:"login success"})
}
export const getAdmin = (req:Request, res:Response) => {

}