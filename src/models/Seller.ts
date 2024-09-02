import mongoose, {Schema,Document,models,model} from "mongoose";
import validator from "validator"
export interface ISeller extends Document  {
  name: string
  avatar:string
  businessInformation: Object
  email: string
  roles: number[]
  password: string
  method:string
  status: string
  payment: string
  refreshToken: string
  passwordResetToken: string
  passwordResetTokenExpiration: Date
}
const sellerSchema = new Schema<ISeller>({
  name:{type: String , trim:true ,required: true},
  avatar:{type: String},
  businessInformation:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true},
  roles:{type: [Number], required: true , default : [2000] },
  email:{type: String,unique: true ,required: true ,validate:[validator.isEmail]},
  password:{type: String, trim:true ,required: true,select:false},
  method:{type: String, trim:true ,required:true ,default:"manual"},
  status:{type: String, trim:true ,required:true,default:"inactive"},
  payment:{type: String, trim:true ,required:true,default:"pending"},
  refreshToken:{type: String, trim:true},
  passwordResetToken:{select:false,type:String,default:null},
  passwordResetTokenExpiration:{type:Date, default:null}
},{
   timestamps: true
})

const Seller = models.Seller || model<ISeller>('Seller',sellerSchema);

export default Seller