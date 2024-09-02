import mongoose, {Schema,Document,models,model, ObjectId} from "mongoose";
import validator from "validator"
export interface ICategory extends Document  {
  name: string
  image: string 
  slug: string
  description: string
  parent_id: Object
}
const categorySchema = new Schema<ICategory>({
  name:{type: String , trim:true ,required: true},
  image:{type: String , trim:true ,required: true},
  slug:{type: String , trim:true ,required: true},
  description:{type: String , trim:true ,required: true},
  parent_id:{type:mongoose.Schema.Types.ObjectId ,default:null}
},{
   timestamps: true
})
categorySchema.index({
  name:"text"
})
const Category = models.Category || model<ICategory>('Category',categorySchema);

export default Category