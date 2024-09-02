
import formidable from "formidable"
import Category from "../models/Category"
import cloudinary from "../utils/cloudinary"
import { error } from "console"
interface AddCategoryDB {
  nameField: string
  descriptionField: string
  parentNameField: string
  imageField: formidable.File
}

export const addCategoryDB = async ({nameField,descriptionField,parentNameField,imageField}:AddCategoryDB) =>{
  try {
    const category = await Category.findOne({name:nameField})
    if(category)
      return { statusCode :401 , error : "category already exists"}
    const uploadImage = await cloudinary.v2.uploader.upload(imageField.filepath,
      {folder:"categories"}
    )
    console.log(uploadImage)
    if(!uploadImage)
      return { statusCode :401 , error : "cant upload the image"}
    console.log("parent name: ",parentNameField)
    let parent = null
    if(parentNameField !== "root")
      parent = await Category.findOne({name:parentNameField})
    console.log("parent",parent)
    if(parent){
      console.log("slug",parent.slug)
      let slug = parent.slug.concat("/",nameField)
      console.log(slug)
      const data = await Category.create({name:nameField,image:uploadImage.url,slug,description:descriptionField,parent_id:parent._id})
      console.log("nested",data)
      return { statusCode : 201 }
    }
    let slug = "".concat("/",nameField)
    const data = await Category.create({name:nameField,image:uploadImage.url,slug,description:descriptionField})
    console.log("root",data)
    return { statusCode : 201 }
  } catch (error) {
    console.log(error)                                                                                                                                                                                                                                                                                                                            
    return { statusCode : 500 , error : "something went wrong" }
  }
}
export const fetchCategoriesNamesDB = async () =>{
  try{
    const categories = await Category.find({},{name:1})
    console.log(categories)
    if(!categories)
      return { statusCode :401 , error : " cannot find categories"}
    return { statusCode : 200 , categories}
  }catch(error){
    console.log(error)
    return { statusCode : 500 , error : "something went wrong" }
  }
}
interface FetchCategoriesChunkDB {
  parsePerPage : number
  safeSearchValue : string
  parseCurPage : number
}
export const fetchCategoriesChunkDB = async ({parseCurPage,safeSearchValue,parsePerPage}:FetchCategoriesChunkDB) =>{
  try{
    if(safeSearchValue){
      const categoriesLen = await Category.find({$text:{$search:safeSearchValue}}).countDocuments();
      const skipCategories = (parseCurPage - 1) * parsePerPage
      const categoriesChunk = 
      await Category.find({$text:{$search:safeSearchValue}}).skip(skipCategories).limit(parsePerPage).sort({createdAt:-1})
      console.log(categoriesChunk)
      if(!categoriesChunk)
        return { statusCode :401 , error : " cannot find categories"}
      return { statusCode : 200 , categoriesChunk ,count:categoriesLen}
    }else{
      const categoriesLen = await Category.find({}).countDocuments();
      const skip = (parseCurPage - 1) * parsePerPage
      const categoriesChunk = await Category.find({}).skip(skip).limit(parsePerPage)
      console.log(categoriesChunk)
      if(!categoriesChunk)
        return { statusCode :401 , error : " cannot find categories"}
      return { statusCode : 200 , categoriesChunk : categoriesChunk , count:categoriesLen}
    }
  }catch(error){
    console.log(error)
    return { statusCode : 500 , error : "something went wrong" }
  }
}