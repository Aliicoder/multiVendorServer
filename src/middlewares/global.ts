import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';
import { queryParser } from 'express-query-parser';
import { app , express } from "../index"
app.use(queryParser({
  parseNull: true, 
  parseBoolean: true, 
  parseNumber: true,
}));
app.use(cookieParser());
const limiter = rateLimit({
  max:500,
  windowMs:60*60*1000,
  message:"Rate limit exceeded"
})
app.use(cors({
  origin:["http://localhost:5173","http://localhost:5174","http://localhost:5175","http://192.168.0.104"],
  methods:["GET","POST","DELETE","PUT","PATCH"],
  credentials:true
}))
//app.use("/api",limiter)//?set 50 requests per hour limit to prevent (Dos)
//app.use(helmet())
if(process.env.NODE_ENV === "development") app.use(morgan('dev')) //? useful for development
app.use(express.json({limit:`10kb`}));//?to read the body with 10kb limit
app.use(mongoSanitize())//?anti xss ex: "email":{"$gt":""} with knowing the password we could login
app.use(hpp({//?by default params duplication allowed but with this 3rd party library is prevented
  whitelist:["duration"]//?params which allow to be duplicated
}))
app.use(express.json());

process.on('uncaughtException', err =>{
  console.log("uncaughtException shutting down server ...")
  console.log(err.name,err.message)
  process.exit(1);
})