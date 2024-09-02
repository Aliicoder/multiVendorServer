import {Schema,Document,models,model, ObjectId} from "mongoose";
import validator from "validator"
export interface IBuyer extends Document  {
  name: string
  email: string
  address: string
  roles: number[]
  password: string
  refreshToken: string
}
const BuyerSchema = new Schema<IBuyer>({
  name:{type: String , trim:true ,required: true},
  address:{type: String , trim:true },
  roles:{type: [Number], required: true , default : [2001] },
  email:{type: String,unique: true ,required: true ,validate:[validator.isEmail]},
  password:{type: String, trim:true ,required: true,select:false},
  refreshToken:{type: String, trim:true}
},{
   timestamps: true
})

const Buyer = models.Buyer || model<IBuyer>('Buyer',BuyerSchema);

export default Buyer