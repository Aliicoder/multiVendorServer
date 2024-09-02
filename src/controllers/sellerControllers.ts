import { Response } from "express-serve-static-core"
import { ExtendRequest } from "../middlewares/authentication"
import { sellerSignupDB , sellerLoginDB} from "../services/sellerServices"
export const sellerSignup = async (req:ExtendRequest,res:Response)=>{
  const {name,businessName,email,password} = req.body
  const { statusCode , data ,refreshToken , error } = 
    await sellerSignupDB({name,businessName,email,password})
  if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
    return res.status(statusCode).json({message:error})
  res.cookie("refreshToken",refreshToken,{
    expires: new Date(Date.now() + 30*24*60*60*1000) 
  })
  res.status(statusCode).json({data,message:"signup successfully"})
}
export const sellerLogin = async (req:ExtendRequest, res:Response) => {
  const {email,password} = req.body
  const {statusCode,data,refreshToken,error} = await sellerLoginDB({email,password})
  if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
    return res.status(statusCode).json({message:error})
  res.cookie("refreshToken",refreshToken,{
    expires: new Date(Date.now() + 30*24*60*60*1000) 
  })
  res.status(statusCode).json({data,message:"login successfully"})
}