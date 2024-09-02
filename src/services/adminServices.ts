import Admin from "../models/Admin"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { genRefreshToken, genToken } from "../middlewares/authentication"
interface AdminsParams {
    email:string
    password:string
}
export const adminLoginDB = async ({email,password}:AdminsParams) =>{
  try {
    const admin = await Admin.findOne({email}).select("+password")
    if(!admin)
      return { statusCode : 404, error : "admin Not Found" }
    const isValidPassword = await bcrypt.compare(password,admin.password)
    if(!isValidPassword)
      return { statusCode : 401, error : "invalid email or password" }
    const token = await genToken({id:admin._id,roles:admin.roles,time:"1m"})
    const refreshToken = await genRefreshToken({id:admin._id,roles:admin.roles,time:"30d"})
    admin.refreshToken = refreshToken
    await admin.save()
    const data = {
      user:{
        name:admin.name,
        avatar : admin.avatar , 
        roles:admin.roles,
      },
      token
    }
    return { statusCode : 200, data , refreshToken }
  } catch (error) {
    return { statusCode : 500 , error : "something went wrong" }
  }
}