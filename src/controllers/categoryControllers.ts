import { ExtendRequest } from "../middlewares/authentication";
import { addCategoryDB, fetchCategoriesNamesDB,fetchCategoriesChunkDB } from "../services/categoryServices";
import { Request , Response } from "express-serve-static-core";
import formidable from "formidable"
export const addCategory = async (req: ExtendRequest, res: Response)=>{
  try {
    const form = formidable()
    const promisifyParse = (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
      return new Promise((resolve) =>{
        form.parse(req, async (error,fields,files)=>{
          if(error) 
            return res.status(401).json({message:"Invalid form submission"})
          return resolve({fields,files})
        })
      })
    }
    const formData = await promisifyParse()
    const { fields ,files } = formData
    const categoryName = fields.categoryName as string[] | undefined;
    const categoryDescription = fields.categoryDescription as string[] | undefined;
    const parentName = fields.parentCategory as string[] | undefined;
    const image = files.media as formidable.File[] | undefined;
    if (!categoryName || !categoryDescription || !parentName || !image) {
      return res.status(400).json({ message: "Missing required form fields or files." });
    }
    const nameField = categoryName[0] || '';
    const descriptionField = categoryDescription[0] || '';
    const parentNameField = parentName[0] || '';
    const imageField = image[0]; 
    const { statusCode,error } = 
      await addCategoryDB({nameField,descriptionField, parentNameField, imageField});
    if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
      return res.status(statusCode).json({message:error})
    res.status(statusCode).json({message:"category added"})
  } catch (e:any) { 
   return { statusCode : 500 , data: "something went wrong :\n"+e.message}
  }
}
export const fetchCategoriesNames = async (req: ExtendRequest, res: Response)=>{
  const {statusCode, categories ,error} = await fetchCategoriesNamesDB()
  if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
    return res.status(statusCode).json({message:error})
  res.status(statusCode).json({categories,message:"categories fetched"})
} 
export const fetchCategoriesChunk = async (req: ExtendRequest, res: Response)=>{
  let { curPage , searchValue , perPage } = req.query 
  const parseCurPage = parseInt(curPage as string) || 1; 
  const parsePerPage = parseInt(perPage as string) || 5; 
  const safeSearchValue = searchValue as string || ''; //console.log("safeSearchValue>>",safeSearchValue)
  const {statusCode, categoriesChunk ,count ,error} = 
    await fetchCategoriesChunkDB({parsePerPage,safeSearchValue,parseCurPage})
  if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
    return res.status(statusCode).json({message:error})
  res.status(statusCode).json({categoriesChunk,count,message:"categories fetched"})
} 