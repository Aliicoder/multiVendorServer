import User, { IUser } from "../models/User"
import { Response } from "express"
import bcrypt from "bcrypt"
import { genAccessAndRefreshTokens } from "../middlewares/authentication"
import Cart from "../models/Cart"
interface registerParams {
  firstName: string
  lastName: string
  email: string
  password: string
}
interface verifyParams {
  email: string
  password: string
}
export interface UserData {
  firstName:string
  lastName:string
  roles:number[]
  token: string
  refreshToken?: string;
}
export const registerUser = async ({firstName,lastName,email,password}:registerParams) => {
 try{
  const IsExistingUser = await User.findOne({email})
  if(IsExistingUser)
    return { statusCode: 409 , error :" user already exists"}
  if(password.length < 8)
    return { statusCode: 403 , error : "password too short "}
  const hashedPassword = await bcrypt.hash(password,10)
  const tokens = genAccessAndRefreshTokens({email})
  const newUser = new User({firstName,lastName,email,password:hashedPassword,refreshToken:tokens.refreshToken})
  const user = await newUser.save()
  const addActiveCartToUser = await Cart.create({userId:user._id,status:"active"})
  if(!addActiveCartToUser){
    await User.findOneAndDelete({email})
    return { statusCode: 409, error : "cart did not added successfully"}
  }
  const data:UserData = {
    firstName: user.firstName,
    lastName: user.lastName,
    roles:user.roles,
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  }
  return  { statusCode : 201 , data }
 }catch(e:any){
    return { statusCode : 500 , error : "something went wrong : "+e.message}
 }
}

export const verifyUser = async ({email,password}:verifyParams) =>{
  try{
    const user = await User.findOne({email}).select("+password")
    if(!user)
      return { statusCode: 404 , error : "user not found"}
    const validPassword = await bcrypt.compare(password,user.password)
    if(!validPassword)
      return { statusCode : 401 , error : "invalid email or password" }
    const tokens = genAccessAndRefreshTokens({email});
    user.refreshToken = tokens.refreshToken;
    const data:UserData = {
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
    await user.save();
    return { statusCode : 200 , data }
  }catch(e:any){
    return { statusCode : 500 , error : "something went wrong : \n" + e.message}
  }
}
interface RefreshTokenProps {
  refreshToken: string
  res:Response
}
export const logOutDB = async ({refreshToken,res}:RefreshTokenProps)=>{
  try{
    const user : IUser | null = await User.findOne({refreshToken})
    if(!user){
      res.clearCookie('jwt',{
        httpOnly: true
      })
      return { statusCode : 403 , error : "user not found" }
    }
    user.refreshToken = ""
    res.clearCookie('jwt',{
      httpOnly: true
    })
    await user.save()
    return { statusCode :200, data : "" }
  }catch(e:any){
    return { statusCode : 500 , error : "something went wrong : \n" + e.message}
  }
}