import { NextFunction } from "express";
import Chat from "../models/Chat";
import Message from "../models/Message";

interface fetchChatsDB {
  senderId: string;
  receiverModelName:string
}
export const fetchChatsDB = async ( {senderId,receiverModelName}:fetchChatsDB, next:NextFunction)=> {
  console.log(senderId,receiverModelName)
  const chats = await Chat.aggregate(
    [
      {
        $match: {
          "participants.userId":senderId,
        }
      },{
        $unwind: {
          path: "$participants",
        }
      },{
        $match: {
          "participants.userType":receiverModelName,
        }
      },{
        $lookup: {
          from: `${receiverModelName}s`,
          localField: "participants.userId",
          foreignField: "_id",
          as: `${receiverModelName}Info`
        }
      },{
        $project: {
          [`${receiverModelName}`]: { $arrayElemAt: [`$${receiverModelName}Info`, 0] },
          "recentMessage": true
        }
      },{
        $project: {
          [`${receiverModelName}._id`]:true,
          [`${receiverModelName}.name`]:true,
          [`${receiverModelName}.businessName`]:true,
          [`${receiverModelName}.avatar`]:true,
          "recentMessage": true
        }
      }
      
    ]
  ) ; 
  console.log("chats >>",chats)
  return {statusCode:200 , chats}
}


interface fetchChatMessagesDB {
  chatId: string;
}
export const fetchChatMessagesDB = async( {chatId}:fetchChatMessagesDB, next:NextFunction)=> {
  const messages = await Message.find({chatId}) ; //console.log( "messages >>",messages)
  return {statusCode:200 ,messages}
}

interface establishClientSellerChatDB {
  clientId: string;
  sellerId: string;
}
export const establishClientSellerChatDB = async ( {clientId,sellerId}:establishClientSellerChatDB, next:NextFunction)=> {
  let chat = await Chat.findOne({$and:[{"participants.userId":clientId},{"participants.userId":sellerId}]})
  if(chat)
    return {statusCode:200, message:"chat already established",chatId:chat._id}
  chat = await Chat.create({
    participants: [
      {
        userId: clientId,
        userType: "client"
      },{
        userId: sellerId,
        userType: "seller"
      }
    ]
  }) 
  console.log("chat 2>>" , chat)
  return {statusCode:200 , chatId:chat._id}
}


interface establishAdminSellerChatDB {
  adminId: string;
  sellerId: string;
}
export const establishAdminSellerChatDB = async ( {adminId,sellerId}:establishAdminSellerChatDB, next:NextFunction)=> {
  let chat = await Chat.findOne({$and:[{"participants.userId":adminId},{"participants.userId":sellerId}]})
  if(chat)
    return {statusCode:200, message:"chat already established",chatId:chat._id}
  chat = await Chat.create({
    participants: [
      {
        userId: adminId,
        userType: "admin"
      },{
        userId: sellerId,
        userType: "seller"
      }
    ]
  }) 
  //console.log("chat 2>>" , chat)
  return {statusCode:200 , chatId:chat._id}
}



interface addMessageDB {
  chatId: string;
  senderId: string;
  receiverId: string;
  message: string
}
export const addMessageDB = async ( {chatId,senderId,receiverId,message}:addMessageDB, next:NextFunction)=> {
  const recentMessage = await Message.create(
      {
        chatId,
        senderId,
        receiverId,
        message
      }
    )
  const chat = await Chat.findByIdAndUpdate(chatId,{$set:{recentMessage:recentMessage.message}});
  console.log("chat >>",chat)
  return {statusCode:200 ,recentMessage}
}
