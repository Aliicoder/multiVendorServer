import jwt from "jsonwebtoken"
import { Request , Response , NextFunction} from "express"
import Seller from "../models/Seller"
export interface ExtendRequest extends Request {
  seller? : any
}
interface TokenProps {
  id: string
  roles: number[]
  time:string
}
export const genToken= ({id,roles,time}:TokenProps)=>{
  const accessToken:string = jwt.sign({id,roles},process?.env?.ACCESS_TOKEN_SECRET!,{
    expiresIn:time
  })
  return accessToken
}
export const genRefreshToken= ({id,roles,time}:TokenProps)=>{
  const accessToken:string = jwt.sign({id,roles},process?.env?.REFRESH_TOKEN_SECRET!,{
    expiresIn:time
  })
  return accessToken
}

type requiredRoles = number[]
export const requireAuth = 
async (req:Request,res:Response,next:NextFunction) =>{
try {
  const accessToken = req.cookies.accessToken
  if(!accessToken) 
    res.status(403).json({error:"please login first"})
  const decodedToken = await jwt.verify(accessToken,process?.env?.ACCESS_TOKEN_SECRET!)
  console.log(decodedToken)

  }catch(e:any){
    res.status(500).send("something went wrong:\n"+e.message)
  }
}
export const auth = (req:ExtendRequest,res:Response,next:NextFunction) =>{
  console.log("authentication")
  try {
    const AuthorizationHeader = req.headers["authorization"]
    console.log(AuthorizationHeader)
    const startsWithBearer = AuthorizationHeader?.startsWith("Bearer")
    if(!startsWithBearer)
      return res.status(403).json({message:"token must start with Bearer"})
    const token = AuthorizationHeader?.split(' ')[1] 
    if (!token)
      return res.status(403).json({message:"token is required"})
    console.log(token,process?.env?.ACCESS_TOKEN_SECRET!)
    jwt.verify(token,process?.env?.ACCESS_TOKEN_SECRET!, async (error,payload) =>{
      if(error){
        console.log(error);
        return res.status(403).json({message:"token not valid"})
      }
        
      if(!payload) 
        return res.status(403).json({message:"token does not have payload"})
      const {id} = payload as {id : string }
      if(!id) 
        return res.status(403).json({message:"token does not have expected payload"});
      const seller  = await Seller.findOne({_id:id})
      console.log(">> seller authenticated")
      req.seller = seller
      next()
    })  
  }catch(e:any){
    res.status(500).send("something went wrong:\n"+e.message)
  }
}


// export const auth =  () =>{
//   return (req:ExtendRequest,res:Response,next:NextFunction) =>{
//     console.log("authentication")
//     try {
//       const AuthorizationHeader = req.get('authorization')
//       const startsWithBearer = AuthorizationHeader?.startsWith("Bearer")
//       if(!startsWithBearer)
//         return res.status(401).send("token must start with Bearer")
//       const token = AuthorizationHeader?.split(' ')[1] 
//       if (!token)
//         return res.status(401).send("token is required")
//       jwt.verify(token,process?.env?.ACCESS_TOKEN_SECRET!, async (error,payload) =>{
//         if(error) 
//           return res.status(403).send("token not valid")
//         if(!payload) 
//           return res.status(403).send("token does not have payload")
//         const {email} = payload as {email : string }
//         if(!email) 
//           return res.status(403).send("token does not have expected payload");
//         const seller  = await Seller.findOne({email})
//         console.log(">> seller authenticated")
//         req.seller = seller
//         next()
//       })  
//     }catch(e:any){
//       res.status(500).send("something went wrong:\n"+e.message)
//     }
//   }
// }
