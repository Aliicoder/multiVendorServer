import { NextFunction, Response } from "express-serve-static-core";
import formidable from "formidable";
import { 
  addProductDB, 
  deleteProductDB, 
  editProductDB, 
  fetchFeaturedProductsDB, 
  fetchProductDB, 
  fetchProductsChunkDB, 
  fetchSearchedProductsDB } from "../services/productServices";
import { ExtendRequest } from "../middlewares/authentication";
import { CatchAsyncError } from "../middlewares/errorsHandler";
import { ApiError } from "../utils/ApiErrors";
import { IProductControllers as IControllers } from ".";
export const fetchProductsChunk = CatchAsyncError(
  async (req:ExtendRequest, res:Response,next:NextFunction) => {
    console.log("--> fetch products chunk request")
    const sellerId  = req?.user?._id
    let { name ,curPage ,perPage ,sortBy } = req.query as unknown as IControllers.IProductsChunk
    sortBy = sortBy ? sortBy : []
    let excluded = ["searchValue","perPage","curPage","sortBy"]
    let mutatedQuery = {...req.query}
    excluded.forEach(param=> delete mutatedQuery[param])
    let queryString = JSON.stringify(mutatedQuery) ; 
    queryString = queryString.replace(/\b(lt|lte|gte|gt)\b/g,match => `$${match}`)
    mutatedQuery = JSON.parse(queryString)
    const query: any = { ...mutatedQuery }
    if (sellerId) query.sellerId = sellerId
    if (name) query.name = { $regex: new RegExp(name, "i") }
    const result = await fetchProductsChunkDB({ query ,curPage ,perPage ,sortBy })
    if(!result)
      return next( new ApiError ("fetching products process failed",400))
    const {statusCode,pagesLen,products} = result
    console.log("<-- fetch products chunk response")
    return res.status(statusCode).json({products,pagesLen,message:"products fetched"})
  }
)

export const addProduct = CatchAsyncError(
  async (req:ExtendRequest,res:Response,next:NextFunction) =>{
    console.log("--> add product request")
    const form = formidable({multiples:true})
    const promisifyParse = (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
      return new Promise((resolve) =>{
        form.parse(req, async (error,fields,files)=>{
          if(error) 
            return next( new ApiError("invalid form submission",400))
          return resolve({fields,files})
        })
      })
    }
    const formData = await promisifyParse()
    const seller = req.user
    const { fields ,files } = formData
    const productNameField = fields.name as string[] | undefined;
    const descriptionField = fields.description as string[] | undefined;
    const brandField = fields.brand as string[] | undefined;
    const stockField = fields.stock as string[] | undefined;
    const priceField = fields.price as string[] | undefined;
    const discountField = fields.discount as string[] | undefined;
    const categoryField = fields.category as string[] | undefined;
    const mediaField = files.media as formidable.File[] | undefined;console.log(seller ,productNameField ,descriptionField ,brandField ,stockField ,priceField  ,categoryField ,mediaField ,discountField)
    if(! seller || !productNameField || !descriptionField || !brandField || !stockField || !priceField  || !categoryField || !mediaField || !discountField )
      return next( new ApiError ("Missing required form fields or files",400))
    const name = productNameField[0] || ""
    const description = descriptionField[0] || '';
    const brand = brandField[0] || '';
    const stock = stockField[0] || '';
    const price = priceField[0] || '';
    const discount = discountField[0] || '';
    const category = categoryField[0] || '';
    const media = mediaField || '' ;
    const result = await addProductDB(
      {seller,name,description,brand,stock,price,discount,category,media},next);
    if(!result)
      return next( new ApiError ("adding product request failed",400))
    const { statusCode } = result 
    console.log("<-- add product response")
    return res.status(statusCode).json({message:"adding product request succeeded"})
  }
)

export const editProduct = CatchAsyncError(
  async (req:ExtendRequest,res:Response,next:NextFunction) =>{
    console.log("-->edit product request")
    const form = formidable({multiples:true})
    const promisifyParse = (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
      return new Promise((resolve) =>{
        form.parse(req, async (error,fields,files)=>{
          if(error) 
            return next( new ApiError("invalid form submission",400))
          return resolve({fields,files})
        })
      })
    }
    const formData = await promisifyParse()
    const seller = req.user
    const { fields ,files } = formData 
    let name = fields.name as string[] | string | undefined;
    let description = fields.description as string[] | string | undefined;
    let brand = fields.brand as string[] | string | undefined;
    let stock = fields.stock as string[] | string | undefined;
    let price = fields.price as string[] | string | undefined;
    let discount = fields.discount as string[] | string | undefined;
    let category = fields.category as string[] | string | undefined;
    let media = files.media as formidable.File[] | undefined; 
    let deletedMedia = fields.deletedMedia as string[]  | undefined;
    let productId = fields.productId as string[] | string | undefined;
    if(! seller || !name || !description || !brand || !stock || !price  || !category || !discount )
      return next( new ApiError("Missing required form fields or files",400))
    name = name ? name[0] : ""
    description = description ? description[0] : '';
    brand = brand ? brand[0] :  '';
    stock = stock ? stock [0] :  '';
    price = price ? price[0] :  '';
    discount = discount ? discount[0] :  '';
    category = category  ? category[0]: '';
    media = media || [] 
    productId = productId ? productId[0] :  "" ;
    deletedMedia = deletedMedia ? deletedMedia : [] 
    const result = await editProductDB(
      {productId,seller,name,description,brand,stock,price,discount,category,media,deletedMedia},next);
    if(!result)
      return next( new ApiError ("updating product request failed",400))  
    const { statusCode } = result
    console.log("<-- edit product response")
    return res.status(statusCode).json({message:"updating product request succeeded"})
  }
)



export const fetchProduct = CatchAsyncError( 
  async (req: ExtendRequest, res: Response , next:NextFunction)=>{
    let  { productId }  = req.params ; 
    productId = productId as string ;
    const result = await fetchProductDB({productId},next)
    if(!result)
      return next( new ApiError ("can`t fetch product",401))
    const {statusCode, product } = result
    res.status(statusCode).json({product,message:"product fetched"})
  } 
)


export const deleteProduct = CatchAsyncError(
  async (req:ExtendRequest,res:Response,next:NextFunction) =>{
    let  productId  = req.query.productId as string
    const result = await deleteProductDB({productId});
    if(!result)
      return next( new ApiError ("delete product process failed",400))
    const { statusCode } = result
    return res.status(statusCode).json({message:"success"})
  }
)

export const fetchFeaturedProducts = CatchAsyncError(
  async (req: ExtendRequest, res: Response,next:NextFunction)=>{
    const result = await fetchFeaturedProductsDB()
    if(!result)
      return next( new ApiError ("fetching featured products process failed",400))
    const { statusCode, products } = result
    return res.status(statusCode).json({products,message:"products fetched"})
  }
)
export const fetchFilterProducts = CatchAsyncError(
  async (req: ExtendRequest, res: Response,next:NextFunction)=>{
    let mutatedQuery = {...req.query}
    // let {searchValue , perPage , sort , curPage } = mutatedQuery as unknown as IFetchFilterProducts
    // let excluded = ["perPage","curPage","sortBy","searchValue"]
    // let excludedIfUndefine = ["rating","price","category"]
    // excluded.forEach(param=> delete mutatedQuery[param])
    // excludedIfUndefine.forEach(param => {
    //   let queryValue = mutatedQuery[param];console.log(param,queryValue)
    //   if ( queryValue === "undefined" || "") 
    //     delete mutatedQuery[param];
    // });
    // let query = JSON.stringify(mutatedQuery) ; 
    // query = query.replace(/\b(lte|gte)\b/g,match => `$${match}`)
    // const result = await fetchFilteredProductsDB({query,searchValue,perPage,curPage,sort})
    // if(!result)
    //   return next( new ApiError ("fetching filter products process failed",400))
    // const {statusCode, products ,productsLen} = result
    // return res.status(statusCode).json({products,productsLen,message:"products fetched"})
  } 
)
export const fetchSearchedProducts = CatchAsyncError(
  async (req: ExtendRequest, res: Response,next:NextFunction)=>{
    const { searchValue ,category } = req.query as unknown as IControllers.IFetchSearchedProducts
    const result =  await fetchSearchedProductsDB({searchValue,category})
    if(!result)
      return next( new ApiError ("fetching searched products process failed",400))
    const { statusCode, products} = result
    return res.status(statusCode).json({products,message:"products fetched"})
  }
)


