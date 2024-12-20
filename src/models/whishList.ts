import { Schema,Document,ObjectId, models, model } from 'mongoose'

export interface IWishList extends Document {
  clientId: ObjectId
  products: ObjectId[]
}
const wishListSchema = new Schema<IWishList>({
  clientId : { type: Schema.Types.ObjectId , ref : "Client",required: true},
  products : { type: [Schema.Types.ObjectId] ,ref:"Product" }
})
const WishList = models.WishList || model<IWishList>('WishList',wishListSchema)
export default WishList