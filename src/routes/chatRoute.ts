import express from 'express';
import { authAdmin, authClient, authSeller } from '../middlewares/authentication';
import { addMessage, 
    establishAdminSellerChat, 
    fetchChatMessages,
    establishClientSellerChat,
    fetchChats, 
} from '../controllers/chatController';
const chatRoute = express.Router();

chatRoute.route("/admin/sellers")
    .get(authAdmin,fetchChats("seller"))

chatRoute.route("/seller/admins")
    .get(authSeller,fetchChats("admin"))
chatRoute.route("/seller/clients")
    .get(authSeller,fetchChats("client"))

chatRoute.route("/client/sellers")
    .get(authClient,fetchChats("seller"))

chatRoute.route("/admin/seller/establish/:sellerId")
    .get(authAdmin,establishAdminSellerChat)

chatRoute.route("/client/seller/establish/:sellerId")
    .get(authClient,establishClientSellerChat)


    
chatRoute.route("/admin/seller/:chatId")
    .get(authAdmin,fetchChatMessages)
    .post(authAdmin,addMessage)

chatRoute.route("/seller/admin/:chatId")
    .get(authSeller,fetchChatMessages)
    .post(authSeller,addMessage)

chatRoute.route("/seller/client/:chatId")
    .get(authSeller,fetchChatMessages)
    .post(authSeller,addMessage)

chatRoute.route("/client/seller/:chatId")
    .get(authClient,fetchChatMessages)
    .post(authClient,addMessage)



export default chatRoute