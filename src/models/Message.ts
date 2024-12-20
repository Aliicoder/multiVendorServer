import {Schema,Document,models,model} from "mongoose";
export interface IMessage extends Document  {
  chatId: Schema.Types.ObjectId
  senderId: Schema.Types.ObjectId
  receiverId: Schema.Types.ObjectId
  message:string
  isDelivered :boolean
  isRead: boolean
}
const MessageSchema = new Schema<IMessage>({
  chatId:{type:Schema.Types.ObjectId,ref:"Chat",required:true},
  senderId:{type:Schema.Types.ObjectId,required:true},
  receiverId:{type:Schema.Types.ObjectId,required:true},
  message:{type:String,trim:true,required:true},
  isDelivered:{type:Schema.Types.Boolean,default:false},
  isRead:{type:Schema.Types.Boolean,default:false}
},{
   timestamps: true
})

const Message = models.Message || model<IMessage>('Message',MessageSchema);

export default Message