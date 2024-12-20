import Product, { IProduct } from "../models/Product"
import Category, { ICategory } from "../models/Category"
import { NextFunction } from "express"
import { ApiError } from "../utils/ApiErrors"
import { deleteImageFromS3Bucket, deleteVideoFromS3Bucket, putImageIntoS3Bucket, putVideoIntoS3Bucket } from "../utils/helpers"
import { v4 as uuid } from 'uuid';
import { IMedia } from "../models"
import { IProductServices as IServices} from "."
export const addProductDB = 
async ({seller,name,description,brand,stock,price,discount,category,media}:IServices.addProductDB,
  next:NextFunction
) => {
  const product: IProduct | null = await Product.findOne({name})
  if(product)
    return next( new ApiError ("Product already exist",400))

  let urls = [];
    for(let file of media){
    const randomId = uuid()
    if(file.mimetype && file.mimetype.startsWith("image/")){
      const [public_id,url] = await putImageIntoS3Bucket(file.filepath,"images",randomId)
      urls.push({public_id,url,type:"image"});
    }
    else if (file.mimetype && file.mimetype.startsWith("video/")) {
      const [public_id,url] = await putVideoIntoS3Bucket(file.filepath,"videos",randomId)
      urls.push({public_id,url,type:"video"});
    } else
      return next( new ApiError ("Unsupported filetype uploaded ",400))
  }

  let parentCategoriesNames = [];
  let parentCategory: ICategory | null = await Category.findOne({name:category})
  if(!parentCategory)
    return next( new ApiError ("cant find product parent category ",400))
  parentCategoriesNames.push(parentCategory.name);
  
  while(parentCategory?.parentId !== null){
    parentCategory = await Category.findOne({name: parentCategory!.name})
    parentCategoriesNames.push(parentCategory?.name)
  }
  let slug = parentCategoriesNames.concat("/",name).join("")
  await Product.create({
    name,
    category,
    sellerId:seller._id,
    root:parentCategoriesNames,
    shopName:seller.name,
    description,
    brand,
    slug,
    media:urls,
    price,
    stock,
    discount
  }) 
  return { statusCode : 200 }
}

export const editProductDB = async ({productId,name,description,brand,stock,price,discount,category,media,deletedMedia}:IServices.updateProductDB,
  next:NextFunction
) => {
  console.log("deleted media >>",deletedMedia)
  const productToBeUpdated:IProduct | null = await Product.findByIdAndUpdate(productId ,{
    name,
    category,
    description,
    brand,
    price,
    stock,
    discount
  },{new:true})

  if(!productToBeUpdated)
    return next( new ApiError ("cant find and update the product ",400))

  let parentCategoriesNames:string[] = []
  let parentCategory: ICategory | null = await Category.findOne({name:category})
  if(!parentCategory)
    return next( new ApiError ("cant find product parent category ",400))
  parentCategoriesNames.push(parentCategory.name);
  
  while(parentCategory?.parentId !== null){
    parentCategory = await Category.findById(parentCategory!._id)
    parentCategoriesNames.push(parentCategory!.name)
  }
  let slug = parentCategoriesNames.concat("/",name).join("")
  productToBeUpdated.root = parentCategoriesNames
  productToBeUpdated.slug = slug

  let filteredMedia:IMedia[] = []
  if(deletedMedia.length > 0){
    for (let deleteFileUrl of deletedMedia){
      for(let file of productToBeUpdated.media){
        if(deleteFileUrl == file.url) {
          console.log("deleted file found")
          if( file.type == "image") 
            await deleteImageFromS3Bucket(file.public_id)
          if( file.type == "video") 
            await deleteVideoFromS3Bucket(file.public_id)
        }    
        else 
          filteredMedia.push(file);
      }
    }
    console.log("filteredMedia >> ",filteredMedia)
    productToBeUpdated.media = filteredMedia
  } 

  let newMedia:IMedia[] = []
  if(media.length > 0) for (let file of media) {
    const randomId = uuid()
    if(file.mimetype && file.mimetype.startsWith("image/")){
      const [public_id,url] = await putImageIntoS3Bucket(file.filepath,"images",randomId)
      newMedia.push({public_id,url,type:"image"});
    }
    else if (file.mimetype && file.mimetype.startsWith("video/")) {
      const [public_id,url] = await putVideoIntoS3Bucket(file.filepath,"videos",randomId)
      newMedia.push({public_id,url,type: "video"});
    } else
      return next( new ApiError ("Unsupported filetype uploaded ",400))
  }
    
  productToBeUpdated.media.push(...newMedia)
  await productToBeUpdated.save()
  return { statusCode : 200 }
}

export const fetchProductsChunkDB = async ({query,curPage,perPage,sortBy}:IServices.fetchProductsChunkDB) =>{
    const productsLen = await Product.countDocuments(query) ; 
    const pagesLen = Math.ceil(productsLen / perPage)
    const skip = ( curPage - 1 ) * perPage 
    const products = await Product.find(query).skip(skip).limit(perPage).sort(sortBy)
    return { statusCode : 200, products , pagesLen}
}

export const fetchProductDB = async ({productId}:IServices.fetchProductDB,
  next:NextFunction
) =>{
  const product = await Product.findOne({_id:productId});
  if(!product)
    return next( new ApiError ("can`t find product",404))
  return { statusCode : 200 , product}
}

export const deleteProductDB = async ({productId}:IServices.deleteProductDB) => {
    const product = await Product.deleteOne({_id: productId})
    if(!product) 
      return { statusCode : 404, error:"Product not found"}
    return { statusCode : 200 }
}


export const fetchFeaturedProductsDB = async () =>{
      const products= await Product.find({}).limit(8); //console.log("productsChunk>>",productsChunk)
      if(!products)
        return { statusCode :401 , error : " cannot find products"}
      return { statusCode : 200 , products }
}

export const fetchFilteredProductsDB = async ({query,searchValue,perPage,curPage}:IServices.fetchFilteredProductsDB) =>{
    if(searchValue){
      console.log(searchValue)
      const productsLen = await Product.find({...JSON.parse(query),name:{ $regex: new RegExp(searchValue, 'i') }}).countDocuments();
      const skipProducts = (curPage - 1) * perPage
      const products= await Product.find({...JSON.parse(query),name:{ $regex: new RegExp(searchValue, 'i') }})
        .skip(skipProducts)
        .limit(perPage);
      if(!products)
        return { statusCode :401 , error : " cannot find products"}
      return { statusCode : 200 , products , productsLen }
    }else{
      const productsLen = await Product.find(JSON.parse(query)).countDocuments();
      const skipProducts = (curPage - 1) * perPage
      const products= await Product.find(JSON.parse(query))
        .skip(skipProducts)
        .limit(perPage);
      if(!products)
        return { statusCode :401 , error : " cannot find products"}
      return { statusCode : 200 , products , productsLen }
    }
}

export const fetchSearchedProductsDB = async ({searchValue,category}:IServices.fetchSearchedProductsDB) =>{
   if(category){
    if(searchValue == "") return  { statusCode:201}
    const products= await Product.find({name:{ $regex: new RegExp(searchValue, 'i') },category}).limit(5)
    if(!products)
      return { statusCode :401 , error : " cannot find products"}
    return { statusCode : 200 , products }
   }else{
    if(searchValue == "") return  { statusCode:201}
    const products= await Product.find({name:{ $regex: new RegExp(searchValue, 'i') }}).limit(5)
    if(!products)
      return { statusCode :401 , error : " cannot find products"}
    return { statusCode : 200 , products }
   }
}

