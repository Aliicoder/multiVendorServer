import formidable from "formidable";
import { ISeller } from "../models/Seller";

export namespace IAdminServices {
  export interface adminsParams {
    email:string
    password:string
  }
}

export namespace ISharedServices {
  export interface adminSellersChat {
    _id: string;
    recentMessage: string;
    seller:{
      _id: string;
      avatar: string;
      businessName?: string;
    }
  }
  export interface fetchSellersChunkDB {
    query : Object
    curPage : number
    perPage : number
    sortBy: []
  }
  export interface fetchSellerProfileDB {
    sellerId: string
  }
  export interface editSellerAccountDB {
    sellerId: string
    status : "active" | "inactive"
  }
}

export namespace IClientServices {
  export interface Signup {
    name: string
    email:string
    password:string
  }
  export interface Login {
    email:string
    password:string
  }
  export interface addAddress {
    clientId:string
    city:string
    area:string
    phone:string
    pinCode:string
    type:string
    province:string
  }
  export interface updateAddress {
    clientId:string
    addressId:string
    city:string
    area:string
    phone:string
    pinCode:string
    type:string
    province:string
  }
  export interface deleteAddress {
    clientId:string
    addressId:string
  }
}

export namespace IProductServices {
  export interface addProductDB {
    seller:ISeller
    name:string
    description:string
    brand:string
    stock:string
    price:string
    discount:string
    category:string
    media:formidable.File[]
  }
  export interface fetchSearchedProductsDB {
    searchValue:string
    category:string
  }
  export interface updateProductDB {
    productId: string
    seller:ISeller
    name:string
    description:string
    brand:string
    stock:string
    price:string
    discount:string
    category:string
    media:formidable.File[]
    deletedMedia:string[]
  }
  
  export interface fetchProductsChunkDB {
    query : Object
    curPage : number
    perPage : number
    sortBy: []
  }
  
  export interface fetchFilteredProductsDB {
    query: string
    searchValue: string
    perPage: number
    curPage: number
    sortBy: number
  }
  
  export interface deleteProductDB {
    productId: string
  }
  
  export interface fetchProductDB {
    productId : string
  }

}



