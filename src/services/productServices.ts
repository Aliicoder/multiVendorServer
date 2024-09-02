import formidable from "formidable"
import cloudinary from "../utils/cloudinary"
import Product from "../models/Product"
import Business from "../models/Business"
import { ISeller } from "../models/Seller"

interface AddProductDB {
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
export const addProductDB = async ({seller,name,description,brand,stock,price,discount,category,media}:AddProductDB) => {
  try{
    console.log("AddProductDB")
    const IsDuplicatedProduct = await Product.findOne({name});console.log("product",IsDuplicatedProduct)
     if(IsDuplicatedProduct)
       return { statusCode : 401 , error : "product already exists" }
    let urls = [];
     for(let file of media){
      let result = await cloudinary.v2.uploader.upload(file.filepath,
        {folder:"products/photos"})
      if(!result)
        return { statusCode : 401,error :"can't upload the media"};
      urls.push(result.url);
    }
    let ancestors = [];
    let counter = 10;
    let ancestor = await Product.findOne({$text:{$search:category}});console.log("ancestor",ancestor)
    ancestors.push(ancestor._id);
    let slug = ancestor.slug.concat("/",name);console.log("slug",slug)
    while(counter >= 0 && !ancestor.parent_id == null){
      ancestors.push(ancestor._id);console.log("ancestor._id",ancestor._id);
      ancestor = await Product.findOne({$text:{$search:category}});console.log("ancestor",ancestor)
      counter--;console.log("counter",counter)
    };console.log("ancestors",ancestors)
    const business = await Business.findById({_id: seller.businessInformation});console.log("business.businessName",business.businessName)  
    const product = await Product.create({
      name,
      category,
      seller_id:seller._id,
      ancestors,
      shopName:business.businessName,
      description,
      brand,
      slug,
      media:urls,
      price,
      stock,
    })
    console.log(product)
    return { statusCode : 200, message:"product created  successfully"}
  }catch(error:any){
    console.log(error)
    return { statusCode : 500 , error : " something went wrong "}
  }
}
interface FetchProductsChunkDB {
  parsePerPage : number
  safeSearchValue : string
  parseCurPage : number
}
export const fetchProductsChunkDB = async ({parseCurPage,safeSearchValue,parsePerPage}:FetchProductsChunkDB) =>{
  try{
    if(safeSearchValue){
      const productsLen = await Product.find({$text:{$search:safeSearchValue}}).countDocuments();
      const skipProducts = (parseCurPage - 1) * parsePerPage
      const productsChunk = 
      await Product.find({$text:{$search:safeSearchValue}}).skip(skipProducts).limit(parsePerPage).sort({createdAt:-1});console.log("productsChunk>>",productsChunk)
      if(!productsChunk)
        return { statusCode :401 , error : " cannot find products"}
      return { statusCode : 200 , productsChunk ,count:productsLen}
    }else{
      const productsLen = await Product.find({}).countDocuments();
      const skipProducts = (parseCurPage - 1) * parsePerPage
      const productsChunk = await Product.find({}).skip(skipProducts).limit(parsePerPage); console.log("productsChunk>>",productsChunk)
      if(!productsChunk)
        return { statusCode :401 , error : " cannot find products"}
      return { statusCode : 200 , productsChunk , count:productsLen}
    }
  }catch(error){
    console.log(error)
    return { statusCode : 500 , error : "something went wrong" }
  }
}
interface FetchProductDB {
  productId : string
}
export const fetchProductDB = async ({productId}:FetchProductDB) =>{
  try{
    const product = await Product.findOne({_id:productId});console.log("product>>",product)
    if(!product)
      return { statusCode :404 , error : "product not found" }
    return { statusCode : 200 , product}
  }catch(error){
    console.log(error)
    return { statusCode : 500 , error : "something went wrong" }
  }
}