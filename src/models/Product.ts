import mongoose, { Schema, Document, models, model, ObjectId } from "mongoose";
import { IMedia, mediaSchema } from ".";

export interface IProduct extends Document {
  _id:ObjectId
  name: string;
  category: string
  sellerId: ObjectId
  shopName: string
  root: string[]
  description: string;
  brand: string
  slug: string
  media: IMedia[];
  price: number;
  stock: number;
  rating: number;
  discount: number;
  outOfStock: boolean
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  root: [{ type: String , required: true }],
  shopName: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: String, required: true },
  slug: { type: String, required: true },
  media: { type: [mediaSchema], required: true },
  discount: { type: Number , default:0},
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  outOfStock: { type: Boolean, default: false }
}, {
  timestamps: true
})

productSchema.index({
  name:1
})

productSchema.pre("save", function (next) {
  this.outOfStock = this.stock === 0;
  next();
})

const Product = models.Product || model<IProduct>("Product", productSchema)
export default Product