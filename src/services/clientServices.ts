
import bcrypt from 'bcrypt'
import { genAccessToken, genRefreshToken} from "../middlewares/authentication"
import mongoose from 'mongoose'
import Client, { IClient } from '../models/Client'
import Cart from '../models/Cart'
import { NextFunction } from 'express'
import { ApiError } from '../utils/ApiErrors'
import { IAddress } from '../models'
import {IClientServices as IServices} from "."

export const clientSignupDB =  async ({name,email,password}:IServices.Signup,next:NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const client = await Client.findOne({email})
  if(client)
    return next( new ApiError (`you already have and account`,404))
  const hashedPassword = await bcrypt.hash(password,10)
  const newClient = await Client.create([{name,email,password:hashedPassword}],{session})
  const newCart = await Cart.create([{clientId:newClient[0]._id}],{session})
  if (!newCart){
    await session.abortTransaction();
    session.endSession();
    return next( new ApiError (`can not create a cart`,401))
  }
  const accessToken = await genAccessToken({id:newClient[0]._id,email,time:"1m"})
  const refreshToken = await genRefreshToken({id:newClient[0]._id,email,time:"30d"})
  newClient[0].refreshToken = refreshToken
  await newClient[0].save({session})
  await session.commitTransaction()
  session.endSession()
  const user = {
    userId:newClient[0]._id,
    name:newClient[0].name,
    avatar:newClient[0].avatar,
    roles:newClient[0].roles,
    accessToken
  }
  return { statusCode : 201, user , refreshToken }
}

export const clientLoginDB = async ({email, password}:IServices.Login,next:NextFunction)=>{
  const client = await Client.findOne({email}).select("+password")
  if(!client)
    return next( new ApiError (`sign up first`,401))
  const isValidPassword = await bcrypt.compare(password,client.password)
  if(!isValidPassword)
    return next( new ApiError (`invalid email or password`,401))
  const accessToken = await genAccessToken({id:client._id,email,time:"1m"})
  const refreshToken = await genRefreshToken({id:client._id,email,time:"30d"})
  client.refreshToken = refreshToken
  await client.save()
  const user = {
    name:client.name,
    avatar:client.avatar,
    roles:client.roles,
    accessToken
  }
  return { statusCode : 201, user , refreshToken }
}

export const addAddressDB = async ({clientId,city,area,phone,pinCode,type,province}:IServices.addAddress,next:NextFunction)=>{
  const client: IClient | null = await Client.findById(clientId)
  if(!client)
    return next( new ApiError (`user not found`,404))
  const address = {
    city,
    area,
    phone,
    pinCode,
    type : type as "home" | "work" | "other",
    province
  }
  client.addresses.push(address)
  await client.save()
  const addresses = client.addresses
  return { statusCode : 200, addresses }
}

export const updateAddressDB = async ({ clientId, addressId, city, area, phone, pinCode, type, province }:IServices.updateAddress,next:NextFunction) => {
  const updatedClient = await Client.findOneAndUpdate(
    {
      _id: clientId,
      "addresses._id": addressId
    },
    {
      $set: {
        "addresses.$.city": city,
        "addresses.$.area": area,
        "addresses.$.phone": phone,
        "addresses.$.pinCode": pinCode,
        "addresses.$.type": type,
        "addresses.$.province": province,
      },
    },
    { new: true, runValidators: true } 
  )
  if (!updatedClient) {
    return next(new ApiError(`User or Address not found`, 404));
  }
  const addresses = updatedClient.addresses;
  return { statusCode: 200, addresses };
};

export const deleteAddressDB = async ({clientId,addressId}:IServices.deleteAddress,next:NextFunction)=>{
  const updatedClient : IClient | null = await Client.findById(clientId)
  if(!updatedClient)
    return next( new ApiError (`user not found`,404))
  console.log(addressId)
  const filteredAddresses = updatedClient.addresses.filter((address:IAddress) => address._id != addressId)
  console.log(filteredAddresses)
  updatedClient.addresses = filteredAddresses
  await updatedClient.save()
  let addresses = updatedClient.addresses
  return { statusCode : 200, addresses }
}


