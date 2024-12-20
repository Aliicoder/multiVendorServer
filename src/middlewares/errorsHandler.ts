import {  ApiError } from "../utils/ApiErrors";
import  { Request ,Response , NextFunction } from "express";
export const CatchAsyncError  = (fn:any) => {
  return(req:Request,res:Response,next:NextFunction)=>{
    fn(req,res,next).catch((err:any) => next(err));
  }
}
 const globalErrorHandler = (err:any,req:Request,res:Response,next:NextFunction) => {
  err.statusCode = err.statusCode || 500 ;
  if(process.env.MODE === "production"){
    let error = {...err} ; //console.log(error)
    error = handleOperationalErrors(error)
    sendProductionError(error,res)
  }else 
    sendDevelopmentError(err,res)
}

export default globalErrorHandler

export const undefinedRouteHandler = (req:Request,res:Response,next:NextFunction) =>{
  next( new ApiError (`cant find ${req.originalUrl} on this server`,404))
}
//?
const handleOperationalErrors = (error:any) =>{
  switch(error.name ?? error.code){
    case "CastError" :
      return handleCastErrors(error)
    case "ValidationError":
      return  handleValidationErrors(error)
    case 11000 :
      return handleDuplicationErrors(error)
    default : 
      return error
  }
}
const handleCastErrors = (error:any) => {
  return new ApiError(`Cast error : invalid ${error.path} : ${error.value}`,400)
}
const handleValidationErrors = (error:any) =>{
  let errorsPath 
  const values = Object.values(error.errors).map((value:any) => value.message)
  return new ApiError(`Validation error : ${values} `,400)
}
const handleDuplicationErrors = (error:any) => {
  const match = JSON.stringify(error.keyValue).match(/(["'])(\\?.)*?\1/)
  const value = match ? match[0] : "unknown field";
  return new ApiError(`Duplicated Field : ${value} `,400)
}

const sendProductionError = (error:any,res:Response) =>{ console.log(error.isOperational)
  if(error.isOperational) 
    res.status(error.statusCode).json({ message: error.message })
  else
    res.status(500).json({ message: "something went wrong" })
   
}
const sendDevelopmentError = (error:any,res:Response) =>{
  res.status(error.statusCode).json({
    message: error.message,
    stack: error.stack,
  })
}