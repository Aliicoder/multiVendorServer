import { Response } from "express-serve-static-core";
import formidable from "formidable";
import { addProductDB, fetchProductDB, fetchProductsChunkDB } from "../services/productServices";
import { ExtendRequest } from "../middlewares/authentication";
export const addProduct = async (req:ExtendRequest,res:Response) =>{
  const form = formidable({multiples:true})
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
  const seller = req.seller;//console.log("sellerId",sellerId)
  const { fields ,files } = formData;//console.log(fields,files)
  const productNameField = fields.name as string[] | undefined;
  const descriptionField = fields.description as string[] | undefined;
  const brandField = fields.brand as string[] | undefined;
  const stockField = fields.stock as string[] | undefined;
  const priceField = fields.price as string[] | undefined;
  const discountField = fields.discount as string[] | undefined;
  const categoryField = fields.category as string[] | undefined;
  const mediaField = files.media as formidable.File[] | undefined;//console.log( sellerId ,productNameField ,descriptionField ,brandField ,stockField ,priceField  ,categoryField ,mediaField ,discountField)
  if(! seller || !productNameField || !descriptionField || !brandField || !stockField || !priceField  || !categoryField || !mediaField || !discountField )
    return res.status(401).json({message:"Missing required form fields or files."})
  const name = productNameField[0] || ""
  const description = descriptionField[0] || '';
  const brand = brandField[0] || '';
  const stock = stockField[0] || '';
  const price = priceField[0] || '';
  const discount = discountField[0] || '';
  const category = categoryField[0] || '';
  const media = mediaField || '' ;// console.log(media);
  const { statusCode,message,error } = await addProductDB(
    {seller,name,description,brand,stock,price,discount,category,media});
  if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
    return res.status(statusCode).json({message:error})
   res.status(statusCode).json({message})
}
export const fetchProductsChunk = async (req: ExtendRequest, res: Response)=>{
  let { curPage , searchValue , perPage } = req.query 
  const parseCurPage = parseInt(curPage as string) || 1; 
  const parsePerPage = parseInt(perPage as string) || 5; 
  const safeSearchValue = searchValue as string || ''; //console.log(safeSearchValue)
  const {statusCode, productsChunk ,count ,error} = 
    await fetchProductsChunkDB({parsePerPage,safeSearchValue,parseCurPage})
  if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
    return res.status(statusCode).json({message:error})
  res.status(statusCode).json({productsChunk,count,message:"products fetched"})
} 
export const fetchProduct = async (req: ExtendRequest, res: Response)=>{
  let  { productId }  = req.query ; console.log("productId>>",productId)
  productId = productId as string ;
  const {statusCode, product ,error} = await fetchProductDB({productId})
  if(statusCode.toString().startsWith("4") || statusCode.toString().startsWith("5"))
    return res.status(statusCode).json({message:error})
  res.status(statusCode).json({product,message:"product fetched"})
} 