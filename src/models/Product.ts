import mongoose, { Schema, Document, models, model, ObjectId } from "mongoose";
import Category from "./Category";

export interface IProduct extends Document {
  name: string;
  category: string;
  seller_id: Object
  shopName: string
  ancestors: Object[]
  description: string;
  brand: string
  slug: string
  media: string[];
  price: number;
  stock: number;
  rating: number;
}

export const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  shopName: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: String, required: true },
  slug: { type: String, required: true },
  media: { type: [String], required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  rating: { type: Number, default: 0 },
}, {
  timestamps: true
})
productSchema.index({
  name: "text",
  category: "text",
  brand: "text",
  description: "text",
}, {
  weights: {
    name: 5,
    Category: 4,
    brand: 3,
    description: 2,
  }
})
const Product = models.Product || model<IProduct>("Product", productSchema)
export default Product