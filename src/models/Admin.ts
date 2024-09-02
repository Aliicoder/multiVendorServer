import {Schema,Document,models,model} from "mongoose";
import validator from "validator"
export interface IAdmin extends Document  {
  avatar:string
  name: string
  email: string
  roles: number[]
  password: string
  refreshToken: string
  method:string
  status: string
  passwordResetToken: string
  passwordResetTokenExpiration: Date
}
const adminSchema = new Schema<IAdmin>({
  name:{type: String , trim:true ,required: true},
  avatar:{type: String},
  roles:{type: [Number], required: true , default : [1999] },
  email:{type: String,unique: true ,required: true ,validate:[validator.isEmail]},
  password:{type: String, trim:true ,required: true,select:false},
  method:{type: String, trim:true ,required:true ,default:"manual"},
  status:{type: String, trim:true ,required:true,default:"active"},
  refreshToken:{type: String, trim:true},
  passwordResetToken:{select:false,type:String,default:null},
  passwordResetTokenExpiration:{type:Date, default:null}
},{
   timestamps: true
})

const Admin = models.Admin || model<IAdmin>('Admin',adminSchema);

export default Admin