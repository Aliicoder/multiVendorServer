import { Schema,Document,ObjectId, models, model } from 'mongoose'
export interface IUnit {
  productId : ObjectId
  title: string
  price: number
  unitPrice : number
  quantity : number
}
export interface ICart extends Document{
  userId : ObjectId
  units : IUnit[]
  numberOfProducts : number
  totalAmount : number
  status : "active" | "settled"
}
const unitSchema = new Schema<IUnit>({
  productId : {type: Schema.Types.ObjectId ,ref:"Product"},
  title : {type: String,required: true},
  price : { type:Number,required: true},
  unitPrice : {type: Number,required: true},
  quantity : {type: Number,required: true ,default: 1 },
})
const cartSchema = new Schema<ICart>({
  userId : { type: Schema.Types.ObjectId , ref : "User",required: true},
  units : { type: [unitSchema] },
  numberOfProducts : { type: Number, default: 0},
  totalAmount : { type: Number, default : 0 },
  status : { type: String , enum : ["active","settled"], default: "active"},
})
const Cart = models.Cart || model<ICart>('Cart',cartSchema)
export default Cart