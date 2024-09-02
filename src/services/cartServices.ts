import { ObjectId } from "mongoose";
import Cart, { ICart ,IUnit } from "../models/Cart"
import Product, { IProduct } from "../models/Product";
import { calcAmount, calcAmountAndNumOfProducts } from "../utils/cartUtils";
import Order, { IOrder, IOrderItem } from "../models/Order";
export interface cartParams {
  userId : ObjectId
}
export const getUserActiveCartDB = async ({userId}:cartParams) =>{
    const activeCart = await Cart.findOne({userId,status:"active"})
    if(!activeCart){
      const newCart = await Cart.create({userId,status:"active"})
      if(!newCart)
        return { statusCode : 403 , data : "can`t create a new cart"}
      return { statusCode : 201 , data : newCart}
    }
    return { statusCode : 200 , data : activeCart }

}
interface UnitParams extends cartParams {
  newUnit:{
    productId: string
    quantity: number
  }
}
export const addUnIntoActiveCartDB = async ({userId,newUnit}:UnitParams) =>{
    const product:IProduct | null = await Product.findById({_id:newUnit.productId})
    if(!product)
      return { statusCode : 404 , data : "product not found" }
    const { statusCode , data } = await getUserActiveCartDB({userId})
    if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
      return { statusCode , data : "cart not found" }
    let cart:ICart = data
    let existingUnit = false
    for (let i = 0 ;i < cart.units.length ;i++){
      if(cart.units[i].productId.toString() === newUnit.productId){
        existingUnit = true
        cart.units[i].price = product.price
        cart.units[i].quantity +=  newUnit.quantity
        cart.units[i].unitPrice = cart.units[i].quantity * product.price
       }
    }
    if(!existingUnit){
      let unit:IUnit =  {
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: newUnit.quantity,
        unitPrice: newUnit.quantity * product.price
      }
      cart.units.push(unit)
      cart = calcAmountAndNumOfProducts(cart)
      cart.save()
      return { statusCode : 201 , data : "new product added" }
    }
    cart = calcAmount(cart)
    await cart.save()
    return { statusCode : 200 , data : " product already in the cart" }
  
}

export const deleteAllUnitsDB = async ({userId}:cartParams)=>{
    const { statusCode , data } = await getUserActiveCartDB({userId})
    if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
      return { statusCode , data }
    let cart:ICart = data
    cart.units = []
    cart.save()
    return { statusCode : 200 , data : " cart deleted "}
}
interface findOneAndDeleteParams {
  userId : ObjectId
  productId : string
}
export const deleteOneUnitFromCartDB = async ({userId,productId}:findOneAndDeleteParams)=>{

    const { statusCode , data } = await getUserActiveCartDB({userId})
    if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
      return { statusCode , data }
    const cart:ICart = data
    const updatedUnits = cart.units.filter((unit:IUnit)=> unit.productId.toString() !== productId )
    cart.units = updatedUnits
    calcAmountAndNumOfProducts(cart)
    cart.save()
    return { statusCode : 200 , data : "unit deleted" }

  
}
interface UpdateUserCartDB {
  userId:ObjectId;
  updatedUnit:{
    productId:string;
    quantity:number;
  }
}
export const updateUserCartDB = async ({userId,updatedUnit}:UpdateUserCartDB)=>{
    try {
      const product:IProduct | null = await Product.findById({_id:updatedUnit.productId})
      if(!product)
        return { statusCode : 404 , data : "product not found" }
      const { statusCode , data } = await getUserActiveCartDB({userId})
      if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
        return { statusCode , data }
      let cart:ICart = data 
      for (let i = 0 ;i < cart.units.length ;i++){
        if(cart.units[i].productId.toString() === updatedUnit.productId){
          cart.units[i].quantity +=  updatedUnit.quantity
          cart.units[i].unitPrice = cart.units[i].quantity * product.price
        }
      }
      cart = calcAmount(cart)
      cart.save()
      return { statusCode : 200 , data : " cart updated "}
    } catch (e:any) {
      return {statusCode:500, data: "something went wrong : \n" + e.message}
    }
}
interface CheckOutDBParams {
  userId : ObjectId
  address : string
  defaultAddress : string
}
export const checkOutDB = async ({userId,address,defaultAddress}:CheckOutDBParams) =>{
  try {
    const {statusCode, data} = await getUserActiveCartDB({userId})
    if(statusCode.toString().startsWith("4"))
      return { statusCode , data }
    let cart:ICart = data
    let orderProducts:IOrderItem[] = [] 
    for(let unit of cart.units) {
      const product :IProduct | null  = await Product.findById({_id:unit.productId})
      if(!product)
        return { statusCode : 404 , data : ` product ${unit.productId} not found` }
      product.stock -= unit.quantity ; 
      orderProducts.push({
        _id:unit.productId,
        title:product.title,
        description:product.description,
        images:product.images,
        price:product.price,
        unitPrice:unit.unitPrice,
        quantity:unit.quantity
      })
      await product.save()
    }
    if(!orderProducts || orderProducts.length <= 0)
      return { statusCode : 403 , data : "Cart is empty" }
    console.log(orderProducts)
    const newOrder = await Order.create({
      userId,
      address: defaultAddress ?? address,
      orderProducts ,
      amount: cart.totalAmount
    })
    console.log("order")
    cart.status = "settled"
    await cart.save()
    await newOrder.save()
    return { statusCode : 201 , data : "order confirmed"}
  } catch (e:any) {
    return {statusCode:500, data: "something went wrong : \n" + e.message}
  }
}