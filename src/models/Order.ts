import { models, ObjectId, Schema ,model } from "mongoose";
export interface IOrderItem {
  _id: ObjectId
  title: string
  description: string
  images: string[]
  price: number
  unitPrice: number
  quantity: number
}
export interface IOrder extends Document {
  userId: ObjectId
  address: string
  orderProducts : IOrderItem[]
  amount: number
}
const orderItemSchema = new Schema<IOrderItem>({
  _id:{type: Schema.Types.ObjectId},
  title:{type:String, required:true},
  description:{type:String, required:true},
  images:{type:[String], required:true},
  quantity: {type:Number, required:true},
  price: {type:Number, required:true}
})
const orderSchema = new Schema<IOrder>({
  userId:{type:Schema.Types.ObjectId,ref:"User",required:true},
  address:{type:String,required:true},
  orderProducts: {type:[orderItemSchema],required:true},
  amount: {type:Number,required:true}
})
const Order = models.Order || model<IOrder>('Order', orderSchema)
export default Order