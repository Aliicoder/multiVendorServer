import mongoose from 'mongoose';
export const connectToDatabase = async () =>{
  try{
    await mongoose.connect("mongodb+srv://kcoc3000:cDzR0OetcNLwZVFo@cluster0.ukedzhr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log(">> Connected to database");
  }catch(err){
    console.log(err);
  }
}
