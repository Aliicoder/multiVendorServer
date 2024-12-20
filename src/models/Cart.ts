import { Schema,Document , models, model, ObjectId } from 'mongoose'
import { ICartOrder, cartOrderSchema } from '.'

export interface ICart extends Document{
  clientId : ObjectId
  orders : ICartOrder[]
  totalNoOfProducts : number
  totalAmount : number
  status : "active" | "settled"
}

const cartSchema = new Schema<ICart>({
  clientId : { type: Schema.Types.ObjectId , ref : "Client",required: true},
  orders : { type: [cartOrderSchema] },
  totalNoOfProducts : { type: Number, default: 0},
  totalAmount : { type: Number, default : 0 },
  status : { type: String , enum : ["active","settled"], default: "active"},
},{
  timestamps:true,
})
cartSchema.index({
  status: 1
})
const Cart = models.Cart || model<ICart>('Cart',cartSchema)
export default Cart


