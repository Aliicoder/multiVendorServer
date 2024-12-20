import mongoose, {Schema,Document,models,model, ObjectId} from "mongoose";
import { IMedia, mediaSchema } from ".";
export interface ICategory extends Document  {
  name: string
  media: IMedia
  slug: string
  description: string
  parentId: ObjectId
}

const categorySchema = new Schema<ICategory>({
  name:{type: String , trim:true ,required: true},
  media:{type: mediaSchema  ,required: true},
  slug:{type: String , trim:true ,required: true},
  description:{type: String , trim:true ,required: true},
  parentId:{type:mongoose.Schema.Types.ObjectId ,ref:"Category",default:null ,required:true},
},{
   timestamps: true
})
categorySchema.index({
  name:1
})
const Category = models.Category || model<ICategory>('Category',categorySchema);

export default Category