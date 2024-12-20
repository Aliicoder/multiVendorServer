import { NextFunction } from "express";
import Product, { IProduct } from "../models/Product";
import WishList, { IWishList } from "../models/whishList";
import { ApiError } from "../utils/ApiErrors";
export interface getWishListDB {
  clientId : string
}
export const fetchWishListDB = async ({clientId}:getWishListDB,next:NextFunction) =>{
  let wishList: IWishList | null = await WishList.findOne({clientId}).populate({
    path:"products",
    model:Product
  })
  wishList = wishList ? wishList : await WishList.create({clientId}) 
  return { statusCode : 200 , wishList }
}
interface addProductToWishList  {
  clientId: string
  productId: string
}
export const addProductToWishListDB = async ({clientId,productId}:addProductToWishList,next:NextFunction) =>{
    const product  = await Product.findById({_id:productId})
    if(!product)
      return { statusCode : 404 , error : "product not found" }
    const wishList = await WishList.findOne({clientId});
    const isProductInWishList = wishList.products.includes(productId)
    if(isProductInWishList)
      return { statusCode : 403 , error: "product already in wishList" }
    wishList.products.push(productId);console.log("wishList >>",wishList)
    await wishList.save()
    return { statusCode : 200 }
}
interface deleteProductFromWishListDB   {
  clientId: string
  productId: string
}
export const deleteProductFromWishListDB = async ({clientId,productId}:deleteProductFromWishListDB,next:NextFunction) =>{
   const product: IProduct | null  = await Product.findById({_id:productId})
   if(!product)
     return { statusCode : 404 , error : "product not found" }
   const wishList = await WishList.findOne({clientId});
   const filteredProducts = wishList.products.filter((product:string) => product != productId);
   wishList.products = filteredProducts
   await wishList.save()
   return { statusCode : 200 }
}

