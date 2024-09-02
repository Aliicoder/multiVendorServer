import {Schema,Document,models,model} from "mongoose";
export interface IBusiness extends Document  {
  businessAvatar:string
  businessName: string
  businessAddress: string
}
const businessSchema = new Schema<IBusiness>({
  businessAvatar:{type: String , trim:true },
  businessName:{type: String , trim:true ,required: true},
  businessAddress:{type: String , trim:true }
},{
   timestamps: true
});
businessSchema.index({
  businessName:"text"
})

const Business = models.Business || model<IBusiness>('Business',businessSchema);

export default Business