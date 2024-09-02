import { Response } from "express-serve-static-core"
import { addUnIntoActiveCartDB , checkOutDB, deleteAllUnitsDB, deleteOneUnitFromCartDB, getUserActiveCartDB, updateUserCartDB } from "../services/cartServices"
import { ExtendRequest } from "../middlewares/authentication"
export const getUserActiveCart = async (req:ExtendRequest,res:Response)=>{
  const userId = req.user._id 
  const {statusCode, data} = await getUserActiveCartDB({userId}) 
  if(statusCode.toString().startsWith("4"))
    return res.status(statusCode).send(data)
  res.status(statusCode).send(data)
}
export const addUnitIntoActiveCart = async (req: ExtendRequest, res: Response)=>{
 try {
  const userId = req.user._id
  const newUnit = { productId :req.body.productId, quantity :req.body.quantity}
  const { statusCode, data } = await addUnIntoActiveCartDB({userId,newUnit});
  if(statusCode.toString().startsWith("4"))
    return res.status(statusCode).send(data)
  res.status(statusCode).send(data)
 } catch (e:any) {
  return { statusCode : 500 , data: "something went wrong :\n"+e.message}
 }
}
export const deleteAllUnits = async (req: ExtendRequest, res: Response)=>{
  try {
    const userId = req.user._id
    const {statusCode, data} = await deleteAllUnitsDB({userId});
    if(statusCode.toString().startsWith("4"))
      return res.status(statusCode).send(data)
    res.status(statusCode).send(data)
  } catch (e:any) {
    return { statusCode : 500 , data: "something went wrong :\n"+e.message}
  }
}
export const deleteOneUnitFromCart = async (req: ExtendRequest, res: Response)=>{
  try {
    const userId = req.user._id
    const productId = req.params.productId
    if (!productId)
      res.status(400).send("product id not specified")
    const {statusCode, data} = await deleteOneUnitFromCartDB({userId,productId})
    if(statusCode.toString().startsWith("4"))
      return res.status(statusCode).send(data)
    res.status(statusCode).send(data)
  } catch (e:any) {
    return { statusCode : 500 , data: "something went wrong :\n"+e.message}
  }
}
export const updateUserCart = async (req: ExtendRequest, res: Response) =>{
  try {
    const userId = req.user._id
    const updatedUnit = { productId :req.body.productId, quantity :req.body.quantity}
    const {statusCode, data} = await updateUserCartDB({userId,updatedUnit})
    res.status(statusCode).send(data)
  } catch (e:any) {
    return { statusCode : 500 , data: "something went wrong :\n"+e.message}
  }
}
export const checkOut = async (req: ExtendRequest, res: Response) =>{
  try {
    const userId = req.user._id
    const defaultAddress = req.user.address
    const address = req.body.address ?? null
    const {statusCode, data} = await checkOutDB({userId,address,defaultAddress})
    if(statusCode.toString().startsWith("4"))
      return res.status(statusCode).send(data)
    res.status(statusCode).send(data)
  } catch (e:any) {
    return { statusCode : 500 , data: "something went wrong :\n"+e.message}
  }
}