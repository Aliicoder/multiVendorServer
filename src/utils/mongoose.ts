import mongoose from 'mongoose';
import { migrateDelete ,migrateRename } from '../models/migrators';
export const connectToDatabase = async () =>{
  try{
    await mongoose.connect("mongodb+srv://kcoc3000:cDzR0OetcNLwZVFo@cluster0.ukedzhr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log(">> Connected to database");

    //! not part of request / response cycle only runs once initialized
    if(false){
      console.log("--> migrate");
      await migrateRename({ collectionName: '',oldFieldName: 'locations', newFieldName: 'addresses'})
      console.log("<-- migrate");
    }
    if(false){
      console.log("--> migrate");
      await migrateDelete({ collectionName: '',fieldName: 'avatar'})
      console.log("<-- migrate");
    }

  }catch(err){
    console.log(err);
  }
}

