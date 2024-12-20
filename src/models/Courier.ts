import {Schema,Document,models,model, ObjectId} from "mongoose";
import validator from "validator"
import { IMedia, mediaSchema } from ".";
export interface ICourier extends Document  {
  media:IMedia;
  name: string
  email: string
  roles: number[]
  password: string
  refreshToken: string
  passwordResetToken:String
  passwordResetTokenExpiration:Date
}
const courierSchema = new Schema<ICourier>({
  media: {type: mediaSchema },
  name:{type: String , trim:true ,required: true},
  roles:{type: [Number], required: true , default : [2002] },
  email:{type: String,unique: true ,required: true ,validate:[validator.isEmail]},
  password:{type: String, trim:true ,required: true,select:false},
  refreshToken:{type: String, trim:true},
  passwordResetToken:{select:false,type:String,default:null},
  passwordResetTokenExpiration:{type:Date, default:null}
},{
   timestamps: true
})

courierSchema.index({
  name:1
})

const Courier = models.Courier || model<ICourier>('Courier',courierSchema);

export default Courier