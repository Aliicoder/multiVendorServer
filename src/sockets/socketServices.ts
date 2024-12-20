import { Server, Socket } from 'socket.io'
import { IChatSockets as ISockets } from '.';

const activeUsers = new Map();
const activeSockets = new Map();
const handleConnections = function(socket:Socket,io:Server){ console.log(`>> socket running with ${activeUsers.size + 1} connections`)
  socket.on("admin>>Connect>>seller",(activeAdminInfo,adminChats)=>{
    let activeAdminSocketId = socket?.id
    console.log(activeAdminInfo)
    activeUsers.set(activeAdminInfo?.userId,activeAdminSocketId)
    activeSockets.set(activeAdminSocketId,activeAdminInfo?.userId)
    socket.join(activeAdminInfo.userId) ;
    if(adminChats.length > 0)
      adminChats.forEach((chat:ISockets.IAdminSellersChat)=>{
      let activeSellerSocketId = activeUsers.get(chat?.seller?._id)
      if(activeSellerSocketId){  
        socket.join(chat?.seller?._id)
        socket.to(activeSellerSocketId).socketsJoin(activeAdminInfo?.userId)
        socket.to(activeSellerSocketId).emit("admin>>Syn>>seller",activeAdminInfo,activeAdminSocketId)
      }
    })
    else console.log("no chats")
  })
  socket.on("seller>>SynAck>>admin",(activeSellerInfo,activeAdminSocketId)=>{ 
    socket.to(activeAdminSocketId).emit("admin<<Ack<<seller",activeSellerInfo)
  })
  socket.on("seller>>Connect>>admin",(activeSellerInfo,sellerChats)=>{ 
    let activeSellerSocketId = socket?.id
    console.log(activeSellerInfo)
    activeUsers.set(activeSellerInfo?.userId,activeSellerSocketId)
    activeSockets.set(activeSellerSocketId,activeSellerInfo?.userId)
    socket.join(activeSellerInfo.userId) ;
    if(sellerChats.length > 0) 
      sellerChats.forEach((chat:ISockets.ISellerAdminsChat)=>{
      let activeAdminSocketId = activeUsers.get(chat?.admin?._id)
      if(activeSellerSocketId){
        socket.join(chat?.admin?._id)
        socket.to(activeAdminSocketId).socketsJoin(activeSellerInfo?.userId)
        socket.to(activeAdminSocketId).emit("seller>>Syn>>admin",activeSellerInfo,activeSellerSocketId)
      }
    })
    else console.log("no chats")
  })
  socket.on("admin>>SynAck>>seller",(activeAdminInfo,activeSellerSocketId)=>{ 
    socket.to(activeSellerSocketId).emit("seller<<Ack<<admin",activeAdminInfo)
  })
  
  socket.on("seller>>Connect>>client",(activeSellerInfo,sellerChats)=>{
    let activeSellerSocketId = socket.id
    activeUsers.set(activeSellerInfo?.userId,activeSellerSocketId)
    activeSockets.set(activeSellerSocketId,activeSellerInfo?.userId)
    socket.join(activeSellerInfo.userId) 
    if(sellerChats.length > 0)
      sellerChats.forEach((chat:ISockets.ISellerClientsChat)=>{
      let activeClientSocketId = activeUsers.get(chat?.client?._id)
      if(activeClientSocketId){  
        socket.join(chat?.client?._id)
        socket.to(activeClientSocketId).socketsJoin(activeSellerInfo?.userId)
        socket.to(activeClientSocketId).emit("seller>>Syn>>client",activeSellerInfo,activeSellerSocketId)
      }
    })
    else console.log("no chats")
  })
  socket.on("client>>SynAck>>seller",(activeClientInfo,activeSellerSocketId)=>{  
    socket.to(activeSellerSocketId).emit("seller<<Ack<<client",activeClientInfo)
  })
  socket.on("client>>Connect>>seller",(activeClientInfo,clientChats)=>{ 
    let activeClientSocketId = socket?.id
    activeUsers.set(activeClientInfo?.userId,activeClientSocketId)
    activeSockets.set(activeClientSocketId,activeClientInfo.userId)
    socket.join(activeClientInfo.userId) 
    if(clientChats.length > 0)
      clientChats.forEach((chat:ISockets.IClientSellersChat)=>{
      let activeSellerSocketId = activeUsers.get(chat?.seller?._id)
      if(activeSellerSocketId){
        socket.join(chat?.seller?._id)
        socket.to(activeSellerSocketId).socketsJoin(activeClientInfo?.userId)
        socket.to(activeSellerSocketId).emit("client>>Syn>>seller",activeClientInfo,activeClientSocketId)
      }
    })
    else console.log("no chats")
  })
  socket.on("seller>>SynAck>>client",(activeSellerInfo,activeClientSocketId)=>{ 
    console.log("activeSellerInfo >>",activeSellerInfo)
    socket.to(activeClientSocketId).emit("client<<Ack<<seller",activeSellerInfo)
  })

  socket.on("disconnect",()=>{
    const userId = activeSockets.get(socket.id)
    console.log(`user ${userId}  disconnected`)
    socket.broadcast.to(userId).emit(`disconnected`,userId)
    if(userId){
      activeSockets.delete(socket.id)
      activeUsers.delete(userId)
    }
  })

  socket.on("admin>>SendMessage>>seller",(message)=>{
    console.log("message sent >>",message)
    const receiverSocketId = activeUsers.get(message?.receiverId)
    if(receiverSocketId)
      socket.to(receiverSocketId).emit("seller<<ReceiveMessage<<admin",message)
  })
  socket.on("seller>>SendMessage>>admin",(message)=>{
    console.log("message sent >>",message)
    const receiverSocketId = activeUsers.get(message?.receiverId)
    if(receiverSocketId)
      socket.to(receiverSocketId).emit("admin<<ReceiveMessage<<seller",message)
  })

  
  socket.on("client>>SendMessage>>seller",(message)=>{
    console.log("message sent >>",message)
    const receiverSocketId = activeUsers.get(message?.receiverId)
    if(receiverSocketId)
      socket.to(receiverSocketId).emit("seller<<ReceiveMessage<<client",message)
  })
  socket.on("seller>>SendMessage>>client",(message)=>{
    console.log("message sent >>",message)
    const receiverSocketId = activeUsers.get(message?.receiverId)
    if(receiverSocketId)
      socket.to(receiverSocketId).emit("client<<ReceiveMessage<<seller",message)
  })
}

export default handleConnections



// const handleConnections = function(socket:Socket){ console.log(">> socket running")
//   socket.on("clientSide:Syn",(activeClientInfo,clientChats)=>{
//     activeUsers.set(activeClientInfo.userId,socket.id)
//     activeSockets.set(socket.id,activeClientInfo.userId)
//     clientChats.forEach((chat:IClientChat)=>{
//       let activeSellerSocketId = activeUsers.get(chat.seller._id)
//       if(activeSellerSocketId){
//         let activeClientSocketId = socket.id
//         socket.to(activeSellerSocketId).emit("sellerSide:SynAck",activeClientInfo,activeClientSocketId)
//       }
//     })
//   })
//   socket.on("clientSide:FinAck",(activeSellerInfo,activeClientSocketId)=>{ //console.log(`${activeSeller.businessName } sending ack to ${activeUser?.businessName ?? activeUser?.name}`)
//     socket.to(activeClientSocketId).emit("clientSide:Ack",activeSellerInfo)
//   })

//   socket.on("sellerSide:Syn",(activeSellerInfo,sellerChats)=>{
//     activeUsers.set(activeSellerInfo.userId,socket.id)
//     activeSockets.set(socket.id,activeSellerInfo.userId)
//     sellerChats.forEach((chat:ISellerChat)=>{
//       let activeClientSocketId = activeUsers.get(chat.client._id)
//       if(activeClientSocketId){  //console.log(`${seller.businessName} sending synAck to  ${chat?.client?.name}`)
//         let activeSellerSocketId = activeUsers.get(chat.client._id)
//         socket.to(activeClientSocketId).emit("clientSide:SynAck",activeSellerInfo,activeSellerSocketId)
//       }
//     })
//   })
//   socket.on("sellerSide:FinAck",(activeClientInfo,activeSellerSocketId)=>{ //console.log(`${sender?.businessName ?? sender?.name} sending ack to ${activeUser?.businessName ?? activeUser?.name}`)
//     socket.to(activeSellerSocketId).emit("sellerSide:Ack",activeClientInfo)
//   })

//   socket.on("disconnect",()=>{
//     const userId = activeSockets.get(socket.id)
//     if(userId){
//       activeSockets.delete(socket.id)
//       activeUsers.delete(userId)
//     }
//   })
// }

// export default handleConnections

// socket.on("sellerConnect",(user,chats)=>{
  //   activeUsers.set(user.userId,socket.id)
  //   console.log("active user >>",user)
  //   chats.forEach((chat:IClientChat)=>{
  //     let activeClientSocketId = activeUsers.get(chat.client._id)
  //     if(activeClientSocketId){
  //       console.log("activeClient >>",chat.client.name)
  //       console.log("to activeClient socket  >>",activeClientSocketId)
  //       socket.to(activeClientSocketId).emit("sellerActive",{seller:user})
  //     }
  //   })
  // })