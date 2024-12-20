import { models, ObjectId, Schema ,model } from "mongoose";
import { addressSchema, IAddress, ICartOrder, unitSchema } from ".";


export interface IOrder extends ICartOrder {
  clientId : ObjectId
  address : IAddress
  courierId: ObjectId
  status : "pending" | "active" | "settled"
}

const OrderSchema = new Schema<IOrder>({
  sellerId : { type: Schema.Types.ObjectId , ref : "Seller",required: true},
  amount: {type: Number,required: true},
  units : { type : [unitSchema] , required: true},
  noOfProducts: {type: Number,required: true},
  shopName : { type: String , required: true},
  clientId : { type: Schema.Types.ObjectId , ref : "Client",required: true},
  address : { type: addressSchema ,required: true},
  courierId : { type:Schema.Types.ObjectId },
  status : { type: String , enum : ["pending","active","settled"], default: "pending"},
},{
  timestamps: true
})
const Order = models.Order || model<IOrder>('Order', OrderSchema)
export default Order





