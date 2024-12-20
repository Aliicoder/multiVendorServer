import { ExtendRequest } from "../middlewares/authentication";
import { CatchAsyncError } from "../middlewares/errorsHandler";
import { addCategoryDB, fetchCategoriesNamesDB,fetchCategoriesChunkDB, fetchCategoriesDB ,deleteCategoryDB, fetchSellerCategoriesDB } from "../services/categoryServices";
import { NextFunction, Request , Response } from "express-serve-static-core";
import formidable from "formidable"
import { ApiError } from "../utils/ApiErrors";
import { ICategoryControllers as IControllers } from ".";
export const fetchCategoriesChunk = CatchAsyncError(
async (req: ExtendRequest, res: Response,next:NextFunction)=>{
  console.log("--> fetch categories chunk request")
  let { name ,curPage ,perPage ,sortBy } = req.query as unknown as IControllers.IFetchCategoriesChunk
  sortBy = sortBy ? sortBy : []
  let excluded = ["searchValue","perPage","curPage","sortBy"]
  let mutatedQuery = {...req.query}
  excluded.forEach(param=> delete mutatedQuery[param])
  let queryString = JSON.stringify(mutatedQuery) ; 
  queryString = queryString.replace(/\b(lt|lte|gte|gt)\b/g,match => `$${match}`)
  mutatedQuery = JSON.parse(queryString)
  const query: any = { ...mutatedQuery }
  if (name) query.name = { $regex: new RegExp(name, "i") }
  const result = await fetchCategoriesChunkDB({ query ,curPage ,perPage ,sortBy })
  if(!result)
    return next(new ApiError('fetching categories chunk request failed', 400));
  const {statusCode, categories , pagesLen} = result
  console.log("<-- fetch categories chunk response")
  return res.status(statusCode).json({categories,pagesLen,message:"fetching categories chunk request succeeded"})
})
export const addCategory = CatchAsyncError(
  async (req: ExtendRequest, res: Response,next:NextFunction)=>{
    console.log("--> add category request")
    const form = formidable()
    const promisifyParse = (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
      return new Promise((resolve) =>{
        form.parse(req, async (error,fields,files)=>{
          if(error) 
            return next(new ApiError('invalid form submission', 400));
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
    if (!categoryName || !categoryDescription || !parentName || !image) 
      return next(new ApiError('Missing required form fields or files.', 400))
    const nameField = categoryName[0] || '';
    const descriptionField = categoryDescription[0] || '';
    const parentNameField = parentName[0] || '';
    const imageField = image[0]; 
    const result = await addCategoryDB({nameField,descriptionField, parentNameField, imageField});
    if(!result)
      return next(new ApiError('fetching categories names request failed', 400));
    const {statusCode} = result
    console.log("<-- add category response")
    return res.status(statusCode).json({message:"category added"})
  }
)


export const fetchCategoriesNames = CatchAsyncError(
  async (req: ExtendRequest, res: Response,next:NextFunction)=>{
    console.log("--> fetch categories names request")
    let  searchValue  = req.query.searchValue as string
    const result = await fetchCategoriesNamesDB({searchValue})
    if(!result)
      return next(new ApiError('fetching categories names request failed', 400));
    const {statusCode, categories } = result
    console.log("<-- fetch categories names response")
    return res.status(statusCode).json({categories,message:"fetching categories names request succeeded"})
  } 
)

export const fetchCategories = CatchAsyncError(
async (req: ExtendRequest, res: Response,next:NextFunction)=>{
  console.log("--> fetch categories request")
  const result = await fetchCategoriesDB(next)
  if(!result)
    return next(new ApiError('fetching categories request failed', 400));
  const {statusCode, categories } = result
  console.log("<-- fetch categories response")
  return res.status(statusCode).json({categories,message:"fetching categories request succeeded"})
})
export const deleteCategory = CatchAsyncError(
  async (req:ExtendRequest,res:Response,next:NextFunction) =>{
    console.log("--> delete category request")
    let  categoryId  = req.query.categoryId as string
    const result = await deleteCategoryDB({categoryId},next);
    if(!result)
      return next(new ApiError('deleting category request failed', 400));
    const { statusCode } = result
    console.log("<-- delete category response")
    return res.status(statusCode).json({message:"deleting category request succeeded"})
  }
)

export const fetchSellerCategories = CatchAsyncError(
  async (req: ExtendRequest, res: Response ,next:NextFunction)=>{
    console.log("--> fetch Seller Categories request")
    const sellerId = req.user._id
    const result = await fetchSellerCategoriesDB({sellerId},next)
    if(!result)
      return next(new ApiError('fetching seller categories request failed', 400));
    const {statusCode, sellerCategories } = result
    console.log("<-- fetch Seller Categories response")
    return res.status(statusCode).json({sellerCategories,message:"fetching seller categories request succeeded"})
  } 
)