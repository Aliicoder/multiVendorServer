import { ICart } from "../models/Cart";

export const calcAmount = (cart:ICart) =>{
  cart.totalAmount  = 0
  for(let i = 0 ;i < cart.units.length;i++){
    cart.totalAmount += cart.units[i].unitPrice
  }
  return cart 
}
export const calcAmountAndNumOfProducts = (cart:ICart) => {
  calcAmount(cart)
  cart.numberOfProducts = cart.units.length
  return cart
}