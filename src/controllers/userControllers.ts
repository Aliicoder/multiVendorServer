import { Request ,Response } from "express"
import { logOutDB, registerUser, UserData, verifyUser } from "../services/userServices"
import { ExtendRequest } from "../middlewares/authentication"

export const signup = async (req:Request,res:Response) =>{
  const { firstName, lastName, email , password } = req.body
  const { statusCode,data:user,error} = await registerUser({ firstName, lastName, email , password })
  if(statusCode.toString().startsWith("4")||statusCode.toString().startsWith("5"))
    return res.status(statusCode).send(error)
  res.cookie('jwt',user?.refreshToken,{
    httpOnly: true,
  })
  delete (user as UserData).refreshToken
  res.status(statusCode).json({user}) 
}

export const login = async (req:Request, res:Response) =>{
 const { email, password } = req.body
 const { statusCode , data:user , error } = await verifyUser({ email, password })
 if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
  return res.status(statusCode).send(error)
 res.cookie('jwt', user?.refreshToken, {
    httpOnly: true,
  });
 delete (user as UserData).refreshToken
 res.status(statusCode).json({user})
}
export const logout = async (req:ExtendRequest, res:Response) =>{
  const refreshToken = req.cookies.jwt
  if(!refreshToken) 
    return res.status(200).json({data:"you already logged out"})
  const { statusCode , data , error } = await logOutDB({refreshToken,res})
  if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
    return res.status(statusCode).send(error)
  res.status(statusCode).json({token:""})
}