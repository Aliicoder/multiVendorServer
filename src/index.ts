import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
import { connectToDatabase } from './utils/mongoose';
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';
import adminLoginRoute from './routes/adminLoginRoute';
import sellerRoute from './routes/SellerRoute';
import refreshSellerRoute from './routes/refreshTokenRoute';
import categoryRoute from './routes/categoriesRoute';
import productRoute from './routes/productRoute';
const app = express();
connectToDatabase()
app.use(cookieParser());
const limiter = rateLimit({
  max:500,
  windowMs:60*60*1000,
  message:"Rate limit exceeded"
})
app.use(cors({
  origin:"http://localhost:5173",
  methods:["GET","POST","DELETE","PUT","PATCH"],
  credentials:true
}))
//app.use("/api",limiter)//?set 50 requests per hour limit to prevent (Dos)
app.use(helmet())
if(process.env.NODE_ENV === "development") app.use(morgan('dev')) //? useful for development
app.use(express.json({limit:`10kb`}));//?to read the body with 10kb limit
app.use(mongoSanitize())//?anti xss ex: "email":{"$gt":""} with knowing the password we could login
app.use(hpp({//?by default params duplication allowed but with this 3rd party library is prevented
  whitelist:["duration"]//?params which allow to be duplicated
}))
app.use(express.json());

//?UNCAUGHTEXCEPTION
process.on('uncaughtException', err =>{
  console.log("uncaughtException shutting down server ...")
  console.log(err.name,err.message)
  process.exit(1);
})

 app.use("/api/v1/admin",adminLoginRoute);
 app.use("/api/v1/seller",sellerRoute);  
 app.use("/api/v1/refresh",refreshSellerRoute);
 app.use("/api/v1/category",categoryRoute);
 app.use("/api/v1/product",productRoute);
// app.use("/api/v1/cart",cartRoute)
// app.use("/api/v1/product",productRoute)
app.use("*",(req,res)=>{
  res.status(404).json({data:"undefined route"})
})

app.listen(process.env.PORT ?? 3001 ,()=>
  console.log(`>> server listening on port ${process.env.PORT ?? 3001}`)
);









// const seedProducts = async () => {
//   await Product.insertMany( [
//     {title:" product 1",description:"lorem1",images:["url1","url2"],price:10,stock:200},
//     {title:" product 2",description:"lorem2",images:["url1","url2"],price:20,stock:10},
//     {title:" product 3",description:"lorem3",images:["url1","url2"],price:3,stock:100},
//     {title:" product 4",description:"lorem4",images:["url1","url2"],price:40,stock:20},
//     {title:" product 5",description:"lorem5",images:["url1","url2"],price:5,stock:30},
//     {title:" product 6",description:"lorem6",images:["url1","url2"],price:25,stock:5},
//   ])

// }
// seedProducts()