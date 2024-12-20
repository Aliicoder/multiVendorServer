import jwt from "jsonwebtoken"
import { Request , Response , NextFunction} from "express"
import Seller from "../models/Seller"
import Admin from "../models/Admin"
import Client from "../models/Client"
import { ApiError } from "../utils/ApiErrors"
import { CatchAsyncError } from "./errorsHandler"
export interface ExtendRequest extends Request {
  user? : any
}
interface TokenProps {
  id: string
  email: string
  time:string
}
export const genAccessToken= ({id,email,time}:TokenProps)=>{
  const accessToken:string = jwt.sign({id,email},process?.env?.ACCESS_TOKEN_SECRET!,{
    expiresIn:time
  })
  return accessToken
}
export const genRefreshToken= ({id,email,time}:TokenProps)=>{
  const accessToken:string = jwt.sign({id,email},process?.env?.REFRESH_TOKEN_SECRET!,{
    expiresIn:time
  })
  return accessToken
}


export const authAdmin = CatchAsyncError(
  async (req:ExtendRequest,res:Response,next:NextFunction) =>{
    const AuthorizationHeader = req.get('authorization'); //console.log(AuthorizationHeader)
    const startsWithBearer = AuthorizationHeader?.startsWith("Bearer")
    if(!startsWithBearer)
      return next( new ApiError("token must start with Bearer",400) )
    const token = AuthorizationHeader?.split(' ')[1];console.log("token >>",token)
    if (!token)
      return next( new ApiError("token is required",400) )
    jwt.verify(token,process?.env?.ACCESS_TOKEN_SECRET!, async (error,payload) =>{
      if(error) 
        return next( new ApiError("invalid token",403) )
      if(!payload) 
        return next( new ApiError("invalid payload",400) )
      const {id ,email} = payload as { id : string , email : string }
      let admin = await Admin.findOne({_id:id,email}); //console.log("admin> >",admin)
      if(!admin)
        return next( new ApiError("admin not found",400))
      req.user = admin
      next()
    })  
  }
)

export const authSeller = CatchAsyncError(
  async (req:ExtendRequest,res:Response,next:NextFunction) =>{
    console.log("--> authenticating seller ...")
    const AuthorizationHeader = req.get('authorization'); //console.log(AuthorizationHeader)
    const startsWithBearer = AuthorizationHeader?.startsWith("Bearer")
    if(!startsWithBearer)
      return next( new ApiError("token must start with Bearer",403) )
    const token = AuthorizationHeader?.split(' ')[1]
    if (!token)
      return next( new ApiError("token is required",403)) 
    jwt.verify(token,process?.env?.ACCESS_TOKEN_SECRET!, async (error,payload) =>{
      if(error) 
        return next( new ApiError("invalid token",403) )
      if(!payload) 
        return next( new ApiError("invalid payload",403) ) 
      const { id } = payload as { id : string }
      let seller = await Seller.findById(id); 
      if(!seller)
        return next( new ApiError("seller not found",400))
      req.user = seller
      console.log("--> seller authenticated  ")
      next()
    })  
  }
)

export const authClient = CatchAsyncError( 
async (req:ExtendRequest,res:Response,next:NextFunction) =>{
  console.log("authenticating client ... ")
  const AuthorizationHeader = req.get('authorization')
  const startsWithBearer = AuthorizationHeader?.startsWith("Bearer")
  if(!startsWithBearer)
    return next( new ApiError("token must start with Bearer",400) )
  const token = AuthorizationHeader?.split(' ')[1]
  if (!token)
    return next( new ApiError("token is required",400) )
  jwt.verify(token,process?.env?.ACCESS_TOKEN_SECRET!, async (error,payload) =>{
    if(error) 
      return next( new ApiError("invalid token",403) )
    if(!payload) 
      return next( new ApiError("invalid payload",400) )
    const {id ,email} = payload as { id : string , email : string }
    let client = await Client.findOne({_id:id,email});
    if(!client)
      return next( new ApiError("client not found",400))
    req.user = client 
    console.log(" ... client authenticated")
    next()
  })  
})









// type requiredRoles = number[]




// export const requireAuth = 
// async (req:Request,res:Response,next:NextFunction) =>{
// try {
//   const accessToken = req.cookies.accessToken
//   if(!accessToken) 
//     res.status(403).json({error:"please login first"})
//   const decodedToken = await jwt.verify(accessToken,process?.env?.ACCESS_TOKEN_SECRET!)
//   console.log(decodedToken)

//   }catch(e:any){
//     res.status(500).send("something went wrong:\n"+e.message)
//   }
// }
// export const auth = (req:ExtendRequest,res:Response,next:NextFunction) =>{
//   console.log("authentication")
//   try {
//     const AuthorizationHeader = req.headers["authorization"]
//     console.log(AuthorizationHeader)
//     const startsWithBearer = AuthorizationHeader?.startsWith("Bearer")
//     if(!startsWithBearer)
//       return res.status(403).json({message:"token must start with Bearer"})
//     const token = AuthorizationHeader?.split(' ')[1] 
//     if (!token)
//       return res.status(403).json({message:"token is required"})
//     console.log(token,process?.env?.ACCESS_TOKEN_SECRET!)
//     jwt.verify(token,process?.env?.ACCESS_TOKEN_SECRET!, async (error,payload) =>{
//       if(error){
//         console.log(error);
//         return res.status(403).json({message:"token not valid"})
//       }
        
//       if(!payload) 
//         return res.status(403).json({message:"token does not have payload"})
//       const {id,roles} = payload as {id : string,roles:number[]}
//       if(!id) 
//         return res.status(403).json({message:"token does not have expected payload"});
//       const seller  = await Seller.findOne({_id:id})
//       console.log(">> seller authenticated")
//       req.seller = seller
//       next()
//     })  
//   }catch(e:any){
//     res.status(500).send("something went wrong:\n"+e.message)
//   }
// }


// export const authAndAuthorization =  (allow:string) =>{
//   return (req:ExtendRequest,res:Response,next:NextFunction) =>{
//     console.log("authentication")
//     try {
//       const AuthorizationHeader = req.get('authorization'); console.log(AuthorizationHeader)
//       const startsWithBearer = AuthorizationHeader?.startsWith("Bearer")
//       if(!startsWithBearer)
//         return res.status(401).send("token must start with Bearer")
//       const token = AuthorizationHeader?.split(' ')[1];console.log("token >>",token)
//       if (!token)
//         return res.status(401).send("token is required")
//       jwt.verify(token,process?.env?.ACCESS_TOKEN_SECRET!, async (error,payload) =>{
//         if(error) { console.log("authentication error >> ",error)
//           return res.status(403).send("token not valid")
//         }    
//         if(!payload) 
//           return res.status(403).send("token does not have payload")
//         const {id ,roles} = payload as {id : string , roles : number[] }
//         if(!id) 
//           return res.status(403).send("token does not have expected payload")
//         console.log("checking User role...")
//         if(allow == "ADMIN" && roles.includes(1999)){ console.log("admin role granted") 
//           let admin = await Admin.findOne({_id:id}); console.log("admin> >",admin)
//           req.admin = admin
//           return next()
//         } 
//         if(allow == "SELLER" && roles.includes(2000)){ console.log("seller role granted") 
//           let seller = await Seller.findOne({_id:id})
//           req.seller = seller
//           return next()
//         }  
//         if(allow == "CLIENT" && roles.includes(2001)){ console.log("client role granted") 
//           let client = await Client.findOne({_id:id}) ; console.log("client >>", client)
//           req.client = client
//           return next()
//         }  
//         return res.status(403).send("unauthorized access")
//       })  
//     }catch(e:any){
//       res.status(500).send("something went wrong:\n"+e.message)
//     }
//   }
// }
