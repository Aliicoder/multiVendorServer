import mongoose, {Schema,Document,models,model } from "mongoose";
interface IAdvertisement extends Document  {
  title: string
  image: string 
  dos: Date
  doe: Date
  link : string
  advertiser_id: Object
}
const advertisementSchema = new Schema<IAdvertisement>({
  title:{type: String , trim:true ,required: true},
  image:{type: String , required: true},
  dos:{type: Date ,required: true},
  doe:{type: Date ,required: true},
  link:{type: String,default:null},
  advertiser_id:{type:mongoose.Schema.Types.ObjectId,ref:"Seller"}
},{
   timestamps: true
})
advertisementSchema.index({
  name:1
})
const Advertisement = models.Advertisement || model<IAdvertisement>('Advertisement',advertisementSchema);

export default Advertisement