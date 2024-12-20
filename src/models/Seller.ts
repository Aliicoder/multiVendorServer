import mongoose, {Schema,Document,models,model} from "mongoose";
import validator from "validator"
import { addressSchema, IAddress, IMedia, mediaSchema } from ".";
export interface ISeller extends Document  {
  name: string
  media: IMedia
  email: string
  password: string
  addresses: IAddress[]
  roles: number[]
  method:string
  status: string
  payment: string
  refreshToken: string
  passwordResetToken: string
  passwordResetTokenExpiration: Date
}
const sellerSchema = new Schema<ISeller>({
  name:{type: String , trim:true ,required: true , unique: true},
  media:{type: mediaSchema },
  email:{type: String,unique: true ,required: true ,validate:[validator.isEmail]},
  password:{type: String, trim:true ,required: true,select:false},
  addresses:{type: [addressSchema] },
  roles:{type: [Number], required: true , default : [2000] },
  method:{type: String, trim:true ,required:true ,default:"manual"},
  status:{type: String, trim:true ,required:true,default:"inactive"},
  payment:{type: String, trim:true ,required:true,default:"pending"},
  refreshToken:{type: String, trim:true},
  passwordResetToken:{select:false,type:String,default:null},
  passwordResetTokenExpiration:{type:Date, default:null}
},{
   timestamps: true
})
sellerSchema.index({
  name:1
})
const Seller = models.Seller || model<ISeller>('Seller',sellerSchema);

export default Seller