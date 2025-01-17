import {Request,Response,NextFunction} from "express";
import asyncHandler from "../../helpers/asyncHandler";
import ErrorConfig from "../../helpers/errorConfig";
import ResponseConfig from "../../helpers/responseConfig";
import generateToken from "../../utils/generateToken";
import user from "../../models/authModel";
import {UserSchema as UserData} from "../../@types/userSchema.types";
import bcrypt from "bcryptjs";
import uploadImageIntoCloudinary from "../../services/cloudinary.service";
const test=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  let bool:boolean=true;
  if(bool){
    let response=new ResponseConfig(200,"this is test message");
    return res.json(response);
  }
    next(new ErrorConfig(401,"You are not authonticate"));
  // next(new Error())
});
const userRegistration=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  let userData:UserData=req.body;
  let userDataValues:string[]=Object.values(userData);
  let uploadProfile;
  let inserData;
  let profileImage:Express.Multer.File | undefined=req.file;
  if(profileImage){
    uploadProfile=await uploadImageIntoCloudinary(profileImage?.path,"authontication/profile");
    console.log({profileImage});
  }
  if(Object.keys(userData).includes("profile") && !profileImage) delete userData?.profile;
  if(userDataValues.some(value=>(value===null || value===undefined || value===" "))){
    return next(new ErrorConfig(400,"All fields are required"));
  }
  let isUserAlreadyExist=await user.findOne({email:userData?.email});
  if(isUserAlreadyExist){
    console.log({isUserAlreadyExist})
    return next(new ErrorConfig(400,"user already exist"));
  }
  let refresh_token_secret=process.env.REFRESH_TOKEN_SECRET as string;
  let refresh_token_expiration_time=Number(process.env.REFRESH_TOKEN_EXPIRATION_TIME);
  let access_token_secret=process.env.ACCESS_TOKEN_SECRET as string;
  let access_token_expiration_time=Number(process.env.ACCESS_TOKEN_EXPIRATION_TIME);
  let access_token_cookie_expiration_time=Number(process.env.ACCESS_TOKEN_COOKIE_EXPIRATION_TIME);
  let refresh_token_cookie_expiration_time=Number(process.env.REFRESH_TOKEN_COOKIE_EXPIRATION_TIME);
  let payload={email:userData?.email,password:userData?.password};
  let refresh_token=await generateToken(refresh_token_secret,Number(refresh_token_expiration_time),payload);
  if(req.file && uploadProfile){
    inserData=await user.create({...userData,profile:uploadProfile.url,refresh_token});
  }else{
  inserData=await user.create({...userData,refresh_token});
  }
  if(inserData){
   let access_token= await generateToken(access_token_secret,Number(access_token_expiration_time),payload);
   res.cookie("access_token",`Bearer ${access_token}`,{
      maxAge:access_token_expiration_time,
      httpOnly:true,
      secure:process.env.ENVIRONMENT==="production"
    });
   res.cookie("refresh_token",`Bearer ${refresh_token}`,
   {
     maxAge:refresh_token_cookie_expiration_time,
     secure:process.env.ENVIRONMENT==="production",
     httpOnly:true
   });
    return res.status(201).json(new ResponseConfig(201,"Welcome,Your account has been created."));
  }
  next(new ErrorConfig(400,"Failed to create account"));
});
const login=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  interface UserData{
    email?:string;
    password?:string;
  }
  let userData:UserData=req.body;
  let userDataValues:string[]=Object.values(userData);
  console.log({userData,userDataValues})
  if(userDataValues.some(value=>(value===undefined || value===null || value===" "))){
    return next(new ErrorConfig(400,"All fields are required"));
  }
  let {email,password}=userData;
  let verifyEmail=await user.findOne({email})
  if(!verifyEmail) return next(new ErrorConfig(400,"Email or password doesn't match !!"));
  if(verifyEmail){
    let verifyPassword=await bcrypt.compare(password as string,verifyEmail.password);
    if(!verifyPassword) return next(new ErrorConfig(400,"Email or password doesn't match !!"));
    let refresh_token_secret=process.env.REFRESH_TOKEN_SECRET as string;
  let refresh_token_expiration_time=Number(process.env.REFRESH_TOKEN_EXPIRATION_TIME);
  let refresh_token_cookie_expiration_time=Number(process.env.REFRESH_TOKEN_COOKIE_EXPIRATION_TIME);
  let access_token_secret=process.env.ACCESS_TOKEN_SECRET as string;
  let access_token_expiration_time=Number(process.env.ACCESS_TOKEN_EXPIRATION_TIME);
  let access_token_cookie_expiration_time=Number(process.env.ACCESS_TOKEN_COOKIE_EXPIRATION_TIME);
  let payload={email:userData.email,password:userData.password};
  let refresh_token=await generateToken(refresh_token_secret,refresh_token_expiration_time,userData);
   let access_token= await generateToken(access_token_secret,access_token_expiration_time,payload);
   res.cookie("access_token",`Bearer ${access_token}`,{
      maxAge:access_token_expiration_time,
      httpOnly:true,
      secure:process.env.ENVIRONMENT==="production"
    });
   res.cookie("refresh_token",`Bearer ${refresh_token}`,
   {
     maxAge:refresh_token_cookie_expiration_time,
     secure:process.env.ENVIRONMENT==="production",
     httpOnly:true
   });
    return res.status(201).json(new ResponseConfig(201,"Welcome,logged in successfully."));
  }
  next(new ErrorConfig(400,"Failed to logged in!!"));
})
 const loggedOut=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json(new ResponseConfig(200,"user logged out"));
})
const profileUpdate=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  let email=req.email as string;
  let updateId=req.params.id as string | number;
  let updatePayload=req.body;
  const isUserExist=await user.findOne({email});
  if(!isUserExist) return next(new ErrorConfig(401,"unauthorized access !!"));
  let updateUser=await user.findByIdAndUpdate(updateId,updatePayload);
  if(updateUser) return res.status(202).json(new ResponseConfig(202,"updated successfully"));
  next(new ErrorConfig(500,"failed to update profile !!"));
})
const getAllUsers=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  let getUsers=await user.find({});
  res.json(new ResponseConfig(200,null,getUsers));
})
export{
  test,
  userRegistration,
  login,
  loggedOut,
  profileUpdate,
  getAllUsers
}