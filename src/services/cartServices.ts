import Cart, { ICart }  from "../models/Cart"
import Product, { IProduct }  from "../models/Product";
import { ICashOnDeliveryPayment } from "../controllers/cartControllers";
import mongoose from "mongoose";
import Order, { IOrder } from "../models/Order";
import e, { NextFunction } from "express";
import { ApiError } from "../utils/ApiErrors";
import { ICartOrder, IUnit } from "../models";

export const getUserPopulatedActiveCartDB = async ({clientId}:cartParams,next:NextFunction) =>{
  let cart = await Cart.findOne({clientId,status:"active"}).populate({
    path:"orders.units.productId",
    model:Product
  })
  cart = cart ? cart : await Cart.create({clientId,status:"active"})
  return { statusCode : 200 , cart }
}

export const getUserActiveCartDB = async ({clientId}:cartParams,next:NextFunction) =>{
  let cart:ICart | null = await Cart.findOne({clientId,status:"active"})
  cart = cart ? cart : await Cart.create({clientId,status:"active"})
  return cart
}

export const addProductToCartDB = async ({clientId,productId}:addUnIntoActiveCartDB,next:NextFunction) =>{
  const product:IProduct | null = await Product.findOne({_id:productId,outOfStock:false}) 
  if(product == null)
    return next( new ApiError("no product to be added found",400))

  let cart:ICart | null = await getUserActiveCartDB({clientId},next)
  if(!cart)
    return next( new ApiError("getting active cart process failed",400))

  let existingOrder = false , existingUnit = false ;

  cart.orders.forEach((order:ICartOrder)=>{
    let isExistingOrder = ()=> product.sellerId.toString() === order.sellerId.toString()
    if(isExistingOrder()){ 
      existingOrder = true 
      order.units.forEach((unit:IUnit)=>{
        let isExistingUnit = () => unit.productId.toString() === productId
        if(isExistingUnit()) { 
          existingUnit = true 
          if(unit.noOfProducts >= product.stock)
            return next( new ApiError("no more stock left",400))
          
          increaseUnitAmountAndQuantity(unit,product.price)
          increaseOrderAmountAndQuantity(order,product.price)
          increaseCartAmountAndQuantity(cart,product.price)
          return
        }
      })

      if(!existingUnit){
        const unit = createNewUnit(product)
        order.units.push(unit);
        increaseOrderAmountAndQuantity(order,product.price)
        increaseCartAmountAndQuantity(cart,product.price)
        return
      }
    }
  })
  
  if(!existingOrder){ 
    const unit = createNewUnit(product)
    const order = createNewOrder(product,unit)
    cart.orders.push(order)
    increaseCartAmountAndQuantity(cart,product.price)
  }

  await cart.save(); 
  await cart.populate({path:"orders.units.productId", model:Product}); 
  return { statusCode: 200, cart }
}

interface deleteProductAndFetchDB  {
  clientId: string
  productId: string
}
export const deleteProductFromCartDB = async ({clientId,productId}:deleteProductAndFetchDB,next:NextFunction) =>{
  const product: IProduct | null  = await Product.findById({_id:productId})
  if(product == null)
    return next( new ApiError("no product to be added found",400))
  
  let cart:ICart | null = await getUserActiveCartDB({clientId},next)
  if(!cart)
    return next( new ApiError("getting active cart process failed",400))

  cart.orders.forEach((order:ICartOrder) => {
    let isExistingOrder = () => product.sellerId.toString() === order.sellerId.toString()
    if(isExistingOrder()){ 
      order.units.forEach((unit:IUnit)=> {
        let isExistingUnit = () => unit.productId.toString() === productId
        if(isExistingUnit()){

          let decreaseWholeAmount = () => {
            unit.noOfProducts --
            order.noOfProducts --
            cart.totalNoOfProducts --
          }
          decreaseWholeAmount()
          let noUnit = () => unit.noOfProducts <= 0 
          if(noUnit()){
            let noOrder = () => order.noOfProducts <= 0 
            if(noOrder()) { 
              const filteredOrders = cart.orders.filter((order:ICartOrder) => 
                order.sellerId.toString() != product.sellerId.toString())
              cart.orders = filteredOrders
              cart.totalAmount -= product.price
              return
            }
            const filterUnits = order.units.filter((unit:IUnit) => unit.productId.toString() != productId)
            order.units = filterUnits
            order.amount -= product.price
            cart.totalAmount -= product.price
            return
          }
          
          unit.price -= product.price
          order.amount -= product.price
          cart.totalAmount -= product.price
        }
      })
    }
  })
  await cart.save()
  await cart.populate({path:"orders.units.productId", model:Product}); 
  return { statusCode : 200 , cart}
}

interface ICashOnDeliveryPaymentDB extends ICashOnDeliveryPayment{
  clientId:string;
}
export const cashOnDeliveryPaymentDB = async ({clientId,address}:ICashOnDeliveryPaymentDB,next:NextFunction) =>{
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const activeCart:ICart = await Cart.findOne({clientId,status:"active"}).populate({
      path:"orders.units.productId",
      model:Product
    }); 
    if(!activeCart){
      session.abortTransaction();
      return next( new ApiError("can`t place the order",400))
    }
    activeCart.status = "settled"
    for( let order of activeCart.orders ) {
      for( let unit of order.units ) {
        const product:IProduct | null = await Product.findById(unit.productId) 
        if(!product)
          return next( new ApiError(`${unit.productId} product not found`,400))
        if(product.stock < unit.noOfProducts)
          return next( new ApiError(`${product.name} is out of stock`,400))
        const stock = product.stock - unit.noOfProducts
        product.stock = stock
        console.log("product >>",product)
        await product.save({session})
      }
      console.log("address >>",address)
      let ORDER = {
        sellerId:order.sellerId,
        amount:order.amount,
        units:order.units,
        noOfProducts:order.noOfProducts,
        shopName:order.shopName,
        clientId,
        address
      }
      console.log("order >>",ORDER)
      const placedOrder = new Order(ORDER);
      await placedOrder.save({ session });
    }
    await session.commitTransaction()
    await activeCart.save() 
    session.endSession()
    return { statusCode : 200  }
  }catch(error:any){ 
    await session.abortTransaction()
    session.endSession()
    return next(new ApiError(`transaction failed : ${error.message}`, 500));
  }
 }



 export interface cartParams {
  clientId : string
}
interface addUnIntoActiveCartDB  {
  clientId: string
  productId: string
}

interface addUnIntoActiveCartDB  {
clientId: string
productId: string
}


const increaseUnitAmountAndQuantity = (unit:IUnit,productPrice:number) =>{
  unit.noOfProducts ++
  unit.price += productPrice
}
const increaseOrderAmountAndQuantity = (order:ICartOrder,productPrice:number) =>{
  order.noOfProducts ++
  order.amount += productPrice
}
const increaseCartAmountAndQuantity = (cart:ICart,productPrice:number) =>{
  cart.totalNoOfProducts ++
  cart.totalAmount += productPrice
}
const createNewUnit = (product:IProduct) =>{
  let UNIT:IUnit =  {
    productId: product._id,
    noOfProducts: 1 ,
    price: product.price
  }
  return UNIT
}
const createNewOrder = (product:IProduct,unit:IUnit) =>{
  let ORDER:ICartOrder = {
    sellerId:product.sellerId,
    units:[unit],
    amount:unit.price,
    noOfProducts:1,
    shopName:product.shopName
  }
  return ORDER
}
