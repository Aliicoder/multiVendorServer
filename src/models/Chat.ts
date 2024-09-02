import mongoose, {Schema,Document,models,model} from "mongoose";
import validator from "validator"
export interface IChat extends Document  {
  seller_id:Object
  participants: Object[]
}
const ChatSchema = new Schema<IChat>({
  seller_id:{type:Schema.Types.ObjectId,ref:"Buyer",required:true},
  participants:[{participant_id:{type:Schema.Types.ObjectId,ref:"Buyer",required:true},}]
},{
   timestamps: true
})

const Chat = models.Chat || model<IChat>('Chat',ChatSchema);

export default Chat