import { NextFunction, Request , Response } from "express"
import { ExtendRequest } from "../middlewares/authentication"
import { CatchAsyncError } from "../middlewares/errorsHandler";
import { ApiError } from "../utils/ApiErrors";
import { 
   addMessageDB,
   fetchChatMessagesDB, 
   establishAdminSellerChatDB,
   establishClientSellerChatDB,
   fetchChatsDB,
  } from "../services/chatServices";
export const fetchChats = (receiverModelName:string)=>{
  return CatchAsyncError( async (req:ExtendRequest, res:Response , next:NextFunction) => {
    console.log("--> fetch chats request")
    const senderId = req.user._id ; console.log("senderId >>",senderId)
    const result  = await fetchChatsDB({senderId,receiverModelName},next)
    if(!result)
      return next(new ApiError('fetching seller chats failed', 400));
    const {statusCode,chats} = result
    console.log("<-- fetch chats response")
    return res.status(statusCode).json({chats,message:"chats fetch succeeded"})
  })
}


export const fetchChatMessages = CatchAsyncError( 
async (req:ExtendRequest, res:Response , next:NextFunction) => {
  console.log("--> fetch chat messages request")
  const chatId = req.params.chatId 
  const result  = await fetchChatMessagesDB({chatId},next)
  if(!result)
    return next(new ApiError('fetch chat messages failed', 500));
  const {statusCode,messages} = result
  console.log("<-- fetch chat messages response")
  return res.status(statusCode).json({messages,message:"messages fetch succeeded"})
})

export const establishClientSellerChat = CatchAsyncError( 
async (req:ExtendRequest, res:Response , next:NextFunction) => {
  console.log("--> establish client seller chat request")
  const clientId = req.user._id 
  const sellerId = req.params.sellerId   
  const result  = await establishClientSellerChatDB({clientId,sellerId},next)
  if(!result)
    return next(new ApiError('establish client seller chat request failed', 400));
  const {statusCode,chatId} = result
  console.log("<-- establish client seller chat response")
  return res.status(statusCode).json({chatId,message:"chat established"})
})

export const establishAdminSellerChat = CatchAsyncError( 
async (req:ExtendRequest, res:Response , next:NextFunction) => {
  console.log("--> establish admin seller chat request")
  const adminId = req.user._id
  const sellerId = req.params.sellerId  
  const result  = await establishAdminSellerChatDB({adminId,sellerId},next)
  if(!result)
    return next(new ApiError('establish admin seller chat failed', 400));
  const {statusCode,chatId} = result
  console.log("--> establish admin seller chat response")
 return res.status(statusCode).json({chatId,message:"chat establish succeeded"})
})


export const addMessage = CatchAsyncError( 
async (req:ExtendRequest, res:Response , next:NextFunction) => {
  const senderId = req.user._id ;
  const chatId = req.params.chatId as string  ; console.log("chatId >>",chatId)
  const receiverId = req.body.receiverId as string   ; console.log("receiverId >>",receiverId)
  const message = req.body.message as string ; console.log("message >>",message)
  const result  = await addMessageDB({chatId,senderId,receiverId,message},next)
  if(!result)
    return next(new ApiError('add message failed', 400));
  const {statusCode,recentMessage} = result
  return res.status(statusCode).json({message:"messages fetched",recentMessage})
})
