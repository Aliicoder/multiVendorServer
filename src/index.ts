import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
import { connectToDatabase } from './utils/mongoose';
import adminRoute from './routes/adminRoute';
import sellerRoute from './routes/SellerRoute';
import refreshRoute from './routes/refreshRoute';
import categoryRoute from './routes/categoriesRoute';
import productRoute from './routes/productRoute';
import clientRoute from './routes/clientRoute';
import cartRoute from './routes/cartRoute';
import wishListRoute from './routes/wishListRoute';
import orderRoute from './routes/orderRoute';
import globalErrorHandler, { undefinedRouteHandler } from './middlewares/errorsHandler';
import chatRoute from './routes/chatRoute';
import { Server as socketIo } from 'socket.io'
import http from 'http'
const app = express();
const server = http.createServer(app)
const io = new socketIo(server,{
  cors:{
    origin:"*",
    methods:["GET","POST","DELETE","PUT","PATCH"],
  }
})
connectToDatabase()

import "./middlewares/global"
import handleConnections from './sockets/socketServices';



app.use("/api/v1/admin",adminRoute);
app.use("/api/v1/seller",sellerRoute);  
app.use("/api/v1/client",clientRoute);
app.use("/api/v1/refresh",refreshRoute);
app.use("/api/v1/category",categoryRoute);
app.use("/api/v1/product",productRoute);
app.use("/api/v1/cart",cartRoute);
app.use("/api/v1/wishList",wishListRoute);
app.use("/api/v1/order",orderRoute);
app.use("/api/v1/chat",chatRoute);
app.all('*',undefinedRouteHandler)
app.use(globalErrorHandler)

io.on('connection',(socket)=>handleConnections(socket,io))

server.listen(process.env.PORT ,()=>
  console.log(`>> server listening on port ${process.env.PORT}`)
);

export { app , express }


