import mongoose from "mongoose";
const connection=async ()=>{
  let url=process.env.DB_URL as string;
  let config={
    user:process.env.DB_USER as string,
    pass:process.env.DB_PASS as string,
    dbname:process.env.DB_NAME as string,
  }
  try{
    await mongoose.connect(url,config);
    console.log("connected successfully");
  }catch(error){
    console.log("Failed to connect to database",error);
    process.exit(1);
  }
}
export default connection;