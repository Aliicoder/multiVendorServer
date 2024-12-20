import { NextFunction, Response } from "express-serve-static-core"
import { ExtendRequest } from "../middlewares/authentication"
import { sellerSignupDB , sellerLoginDB , fetchSellerDashboardDataDB} from "../services/sellerServices"
import formidable from "formidable"
import { CatchAsyncError } from "../middlewares/errorsHandler"
import { ApiError } from "../utils/ApiErrors"
interface sellerSignup {
  name: string
  businessName: string
  email: string
  password: string
}
export const sellerSignup = CatchAsyncError( 
  async (req:ExtendRequest,res:Response,next:NextFunction)=>{
    console.log("--> seller signup request")
    const {name,businessName,email,password} = req.body as sellerSignup 
    const result =  await sellerSignupDB({name,businessName,email,password},next)
    if(!result)
      return next( new ApiError("sign up process failed",400))
    const { statusCode , user ,refreshToken } = result
    res.cookie("sellerToken",refreshToken,{
      expires: new Date(Date.now() + 30*24*60*60*1000),
      secure: process.env.MODE === "production",
      sameSite: process.env.MODE === "production" ? "none" : "lax",
      httpOnly: true
    })
    console.log("<-- seller signup response")
    return res.status(statusCode).json({user,message:"signup succeeded"})
  }
)
interface sellerLogin {
  email: string
  password: string
}
export const sellerLogin = CatchAsyncError( 
async ( req:ExtendRequest, res:Response, next:NextFunction) => {
  console.log("--> seller login request")
  const {email,password} = req.body as sellerLogin
  const result = await sellerLoginDB({email,password},next)
  if(!result)
    return next( new ApiError("login request request failed",400))
  const {statusCode,user,refreshToken} = result
  res.cookie("sellerToken",refreshToken,{
    expires: new Date(Date.now() + 30*24*60*60*1000),
    secure: process.env.MODE === "production",
    sameSite: process.env.MODE === "production" ? "none" : "lax",
    httpOnly: true
  })
  console.log("<-- seller login response")
  return res.status(statusCode).json({user,message:"login request succeeded"})
})
// export const fetchSellerProfile = CatchAsyncError( 
// async ( req:ExtendRequest, res:Response, next:NextFunction) => {
//   console.log("--> fetch seller profile request")
//   let  businessId  = req.user.businessId as string 
//   const result = await fetchSellerProfileDB({businessId})
//   if(!result)
//     return next( new ApiError("fetch seller profile request failed",400))
//   const {statusCode,businessInformation} = result
//   const profile = {
//     seller:req.user,
//     businessInformation
//   }
//   console.log("<-- fetch seller profile response")
//   return res.status(statusCode).json({profile,message:"profile fetch request succeeded"})
// })

// export const setGeneralInfo = CatchAsyncError( 
// async ( req:ExtendRequest, res:Response, next:NextFunction) => {
//   console.log("--> fetch general info request")
//   const seller = req.user
//   const form = formidable()
//   const promisifyParse = (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
//     return new Promise((resolve) =>{
//       form.parse(req, async (error,fields,files)=>{
//         if(error) 
//           return next( new ApiError("Invalid form submission",400))
//         return resolve({fields,files})
//       })
//     })
//   }
//   const formData = await promisifyParse()
//   const { fields ,files } = formData; console.log("formData >>",fields,files)
//   let image = files.image as formidable.File[] | undefined; 
//   if(!image)
//     return next( new ApiError("Missing required form fields or files",400))
//   let avatar =  image[0] ; console.log("avatar >> ",avatar)
//   const result = await setGeneralInfoDB({seller,avatar},next)
//   if(!result)
//     return next( new ApiError("set seller generalInfo request failed",400))
//   const {statusCode} = result
//   console.log("<-- fetch general info response")
//   return res.status(statusCode).json({message:"set generalInfo request succeeded"})
// })

// export const setBusinessInfo = CatchAsyncError( 
// async (req:ExtendRequest, res:Response,next:NextFunction) => {
//   console.log("--> setBusiness info request")
//   const { business_id } = req.user
//   let { state , district , subDistrict } = req.body
//   const result = await setBusinessInfoDB({business_id , state , district , subDistrict })
//   if(!result)
//     return next( new ApiError("set business info request failed",400))
//   const {statusCode} = result
//   console.log("<-- setBusiness info response")
//   return res.status(statusCode).json({message:"set businessInfo request succeeded"})
// })

export const fetchSellerDashboardData = CatchAsyncError( 
async (req: ExtendRequest, res: Response,next:NextFunction) =>{
  console.log("--> fetch seller dashboard data request")
  const sellerId = req.user._id
  const result = await fetchSellerDashboardDataDB({sellerId})
  if(!result)
    return next( new ApiError("fetch seller dashboard request failed",400))
  const {statusCode, statistics } = result
  console.log("--> fetch seller dashboard data response")
  return res.status(statusCode).json({statistics,message:"fetch seller dashboard request succeeded"})
})

