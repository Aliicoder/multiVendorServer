import {Schema,Document,models,model, ObjectId} from "mongoose";
import validator from "validator"
import { addressSchema, IAddress, IMedia, mediaSchema } from ".";

export interface IClient extends Document  {
  media:IMedia;
  name: string
  email: string
  addresses: IAddress[]
  roles: number[]
  password: string
  refreshToken: string
  passwordResetToken:String
  passwordResetTokenExpiration:Date
}
const clientSchema = new Schema<IClient>({
  name:{type: String , trim:true ,required: true},
  media: {type: mediaSchema },
  email:{type: String,unique: true ,required: true ,validate:[validator.isEmail]},
  password:{type: String, trim:true ,required: true,select:false},
  addresses:{type: [addressSchema] },
  roles:{type: [Number], required: true , default : [2001] },
  refreshToken:{type: String, trim:true},
  passwordResetToken:{select:false,type:String,default:null},
  passwordResetTokenExpiration:{type:Date, default:null}
},{
   timestamps: true
})

clientSchema.index({
  name:1
})

const Client = models.Client || model<IClient>('Client',clientSchema);

export default Client