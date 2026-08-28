import 'dotenv/config';
import mongoose from 'mongoose';
import { MongoClient,ServerApiVersion } from 'mongodb';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = process.env.Mongdb_connectionstring;


export async function run() {
  
  try { 
    await mongoose.connect(uri);
    console.log("Kết nối CSDL thành công");
  } catch (error) {
    console.error("Kết nôi CSDL thất bại:", error);
  }
};
