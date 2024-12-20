
import formidable from "formidable"
import Category, { ICategory } from "../models/Category"
import cloudinary from "../utils/cloudinary"
import { NextFunction } from "express"
import Product from "../models/Product"
import { ApiError } from "../utils/ApiErrors"
interface AddCategoryDB {
  nameField: string
  descriptionField: string
  parentNameField: string
  imageField: formidable.File
}

// db.categories.aggregate([
//   { $match: { parentId: null } },
//   {
//     $graphLookup: {
//       from: "categories",
//       startWith: "$_id",
//       connectFromField: "_id",
//       connectToField: "parentId",
//       as: "subcategories"
//     }
//   }
// ]);
//     fetch the tree from the database
export const addCategoryDB = async ({nameField,descriptionField,parentNameField,imageField}:AddCategoryDB) =>{
  try {
    const category = await Category.findOne({name:nameField})
    if(category)
      return { statusCode :401 , error : "category already exists"}
    const uploadImage = await cloudinary.v2.uploader.upload(imageField.filepath,
      {folder:"categories"}
    ); console.log("uploaded image",uploadImage)
    if(!uploadImage)
      return { statusCode :401 , error : "cant upload the image"}
    let parent = null ;  console.log("parent name: ",parentNameField)
    if(parentNameField !== "root")
      parent = await Category.findOne({name:parentNameField})
    console.log("parent >> ",parent)
    if(parent){ console.log("slug >>",parent.slug)
      let slug = parent.slug.concat("/",nameField) ;console.log("slug >>",slug)
      const data = await Category.create({
        name:nameField,
        image:{url:uploadImage.url,public_id:uploadImage.public_id},
        slug,
        description:descriptionField,
        parent_id:parent._id}
      ) ; console.log("nested >>",data)
      return { statusCode : 201 }
    }
    let slug = "".concat("/",nameField)
    const data = await Category.create({
      name:nameField,
      image:{url:uploadImage.url,public_id:uploadImage.public_id},
      slug,
      description:descriptionField
    })
    console.log("root",data)
    return { statusCode : 201 }
  } catch (error) {
    console.log(error)                                                                                                                                                                                                                                                                                                                            
    return { statusCode : 500 , error : "something went wrong" }
  }
}
interface FetchCategoriesNamesDB {
  searchValue: string
}
export const fetchCategoriesNamesDB = async ({searchValue}:FetchCategoriesNamesDB) =>{
    const categories = await Category.find({name:{ $regex: new RegExp(searchValue, 'i') }},{name:1}).limit(3)
    return { statusCode : 200 , categories}
}
interface fetchSellerCategoriesDB {
  sellerId: string
}
export const fetchSellerCategoriesDB = async ({sellerId}:fetchSellerCategoriesDB,next:NextFunction) =>{
  const categories = await Product.aggregate([
    {
      $match: {
        sellerId
      }
    }
    ,
    {
      $group: {
        _id: null,
        sellerCategories: { $addToSet: "$category" }
      }
    }
    ,
    {
      $project: {
        _id: 0, 
        sellerCategories: 1 
      }
    }
  ]) 

  if(categories.length > 0) {
    const sellerCategories = categories[0].sellerCategories
    return { statusCode : 200 , sellerCategories }    
  } else

  return next(new ApiError('cant fetch seller categories', 400));
}
interface FetchCategoriesChunkDB {
  query : Object
  curPage : number
  perPage : number
  sortBy: []
}
export const fetchCategoriesChunkDB = async ({query,curPage,perPage,sortBy}:FetchCategoriesChunkDB) =>{
  const categoriesLen = await Category.countDocuments(query) ; 
  const pagesLen = Math.ceil(categoriesLen / perPage)
  const skip = ( curPage - 1 ) * perPage 
  const categories = await Category.find(query).skip(skip).limit(perPage).sort(sortBy)
  return { statusCode : 200, categories , pagesLen}
}

export const fetchCategoriesDB = async (next:NextFunction) =>{
  const categories = await Category.find().limit(6).sort({createdAt:-1})
  if(!categories)
    return next(new ApiError('cant fetch categories', 400));
  return { statusCode : 200 , categories }
}
interface deleteCategoryDB {
  categoryId: string
}
export const deleteCategoryDB = async ({categoryId}:deleteCategoryDB,next:NextFunction) => {
  const category = await Category.findOne({_id: categoryId})
  if(category){
    const image = category?.image
    let result ;
    if(image)
      result= await cloudinary.v2.uploader.destroy(image.public_id)
    if(result.result !==  "ok")
      return { statusCode : 401 , error :"error deleting media"}
  }
  else
    return next(new ApiError('cant fetch seller categories', 400));
  return { statusCode : 200 }
}