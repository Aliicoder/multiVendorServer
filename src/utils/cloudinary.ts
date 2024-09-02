import cloudinary from "cloudinary"
cloudinary.v2.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_KEY,
  api_secret:process.env.CLOUDINARY_SECRET,
  secure:true
})
cloudinary.v2.url("categories",{
  fetch_format:"auto",
  quality:"auto"
})
cloudinary.v2.url("categories",{
  crop:"auto",
  gravity:"auto",
  width:500,
  height:500
})
export default cloudinary