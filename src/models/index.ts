import {  ObjectId, Schema  } from "mongoose";

export interface IAddress {
  _id?: string;
  type: "home" | "work" | "other"
  city:string;
  area:string;
  phone:string;
  pinCode:string;
  province:string;
}
export const addressSchema = new Schema <IAddress>({
  type : { type:String,enum:["work","home","other"],required:true},
  city: { type:String ,required:true },
  area: { type:String ,required:true },
  phone:{ type:String ,required:true },
  pinCode:{ type:String ,required:true},
  province:{ type:String ,required:true},
})

export interface IUnit {
  productId: ObjectId
  price : number
  noOfProducts : number
}
export const unitSchema = new Schema<IUnit>({
  productId : {type:Schema.Types.ObjectId,ref:"Product" ,required:true},
  price : {type: Number,required: true},
  noOfProducts : {type: Number,required: true ,default: 1 },
},{
  _id: false
})

export interface ICartOrder {
  sellerId: ObjectId
  units:IUnit[]
  amount : number
  noOfProducts : number
  shopName : string
}
export const cartOrderSchema = new Schema<ICartOrder>({
  sellerId : {type:Schema.Types.ObjectId,ref:"seller" ,required:true},
  amount : {type: Number,required: true},
  units : { type : [unitSchema] , required: true},
  noOfProducts : {type: Number,required: true ,default: 1 },
  shopName:{type: String}
  },{
    _id: false
  }
)

export interface IMedia {
  url: string
  public_id: string
  type: "image" | "video"
}
export const mediaSchema = new Schema<IMedia>({
  url: {type: String ,required: true},
  public_id: {type: String ,required: true},
  type: {type: String , enum:["image","video"] ,required: true}
},{
  _id:false
})


export interface IParticipant {
  userId: Schema.Types.ObjectId;
  userType: "client" | "seller" | "admin"
}
export const ParticipantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    userType: { type: String, required: true, enum: ["client", "seller","admin"] },
  },
  { _id: false } 
);