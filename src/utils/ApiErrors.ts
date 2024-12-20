export class ApiError extends Error {
  statusCode: number 
  isOperational:boolean
  constructor(message:string,statusCode:number){
    super(message)
    this.statusCode = statusCode || 500
    this.isOperational = true
    Error.captureStackTrace(this,this.constructor)
  }
}