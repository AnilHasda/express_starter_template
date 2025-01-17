import {Request,Response,NextFunction} from "express";
import {Schema,model} from "mongoose";
import bcrypt from "bcryptjs";
import {UserSchema} from "../@types/userSchema.types";
const userSchema=new Schema<UserSchema>({
  fname:{
    type:String,
    required:true
  },
  lname:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  profile:{
    type:String
  },
  refresh_token:{
    type:String,
    required:true
  },
  role:{
    type:String,
    enum:["admin","user","moderator"],
    default:"user"
  }
},{timestamps:true});
userSchema.pre("save",async function (next){
  if(!this.isModified("password")) next();
  try{
  this.password=await bcrypt.hash(this.password,10);
  next();
  }catch(error){
    console.log(JSON.stringify(error),null,2)
  }
})
let user=model<UserSchema>("user",userSchema);
export default user;