import asyncHandler from "../../helpers/asyncHandler";
import ErrorConfig from "../../helpers/errorConfig";
import ResponseConfig from "../../helpers/responseConfig";
import generateToken from "../../utils/generateToken";
import user from "../../models/authModel";
import {UserSchema as UserData} from "../../@types/userSchema.types";
import bcrypt from "bcryptjs";
import generateOtp from "../../utils/generateOtp";
import generateOtpExpirationTime from  "../../utils/generateOtpExpirationTime";
import uploadImageIntoCloudinary from "../../services/cloudinary.service";
import path from "path";
import ejs from "ejs";
import sendEmail from "../../services/email";
import mongoose from "mongoose";
const test=asyncHandler(async(req,res,next)=>{
  let bool:boolean=true;
  if(bool){
    let response=new ResponseConfig(200,"this is test message");
    return res.json(response);
  }
    next(new ErrorConfig(401,"You are not authonticate"));
  // next(new Error())
});
const deleteUserModle=asyncHandler(async(req,res,next)=>{
  delete mongoose.models["users"];
  res.json(new ResponseConfig(200,"uset model deleted successfully"));
})
const userRegistration=asyncHandler(async(req,res,next)=>{
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
  let otp=generateOtp();
  let hashedOTP=await bcrypt.hash(otp,10);
  let otpExpiresAt=generateOtpExpirationTime();
  console.log({otp,otpExpiresAt});
  if(req.file && uploadProfile){
    inserData=await user.create({...userData,
    profile:uploadProfile.url,
    refresh_token,
    otp:hashedOTP,
    otpExpiresAt
    });
  }else{
  inserData=await user.create({...userData,
  refresh_token,
  otp:hashedOTP,
  otpExpiresAt
  });
  }
  if(inserData){
    let templatePath=path.join(__dirname,"../../../viewsverificationEmailTemplate.ejs");
    type Data={
      user:string;
      otpCode:string | number;
    }
     let data:Data={
       user:userData.fname,
       otpCode:otp
    }
    ejs.renderFile(templatePath,{data},async function (err,htmlTemplate){
    if(err){
      console.log({error:err});
      throw new Error("failed to register user");
  }
  await sendEmail("Verification Email","Verification Email",userData.email,htmlTemplate);
    })
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
const login=asyncHandler(async(req,res,next)=>{
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
  if(verifyEmail?.isVerified===false) return next(new ErrorConfig(400,"please verify your account"));
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
 const loggedOut=asyncHandler(async(req,res,next)=>{
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json(new ResponseConfig(200,"user logged out"));
})
const profileUpdate=asyncHandler(async(req,res,next)=>{
  let email=req.email as string;
  let updateId=req.params.id as string | number;
  let updatePayload=req.body;
  const isUserExist=await user.findOne({email});
  if(!isUserExist) return next(new ErrorConfig(401,"unauthorized access !!"));
  let updateUser=await user.findByIdAndUpdate(updateId,updatePayload);
  if(updateUser) return res.status(202).json(new ResponseConfig(202,"updated successfully"));
  next(new ErrorConfig(500,"failed to update profile !!"));
})
const getAllUsers=asyncHandler(async(req,res,next)=>{
  let getUsers=await user.find({});
  res.json(new ResponseConfig(200,null,getUsers));
})
const verifyOtp=asyncHandler(async(req,res,next)=>{
  let {email}=req.body;
  let findUser=await user.findOne({email});
  if(!findUser) return next(new ErrorConfig(401,"unauthorized access"));
  let verifyOtpCode=await bcrypt.compare(req.params.otpCode,findUser.otp as string);
  if(!verifyOtpCode || !findUser.otpExpiresAt) return next(new ErrorConfig(401,"Invalid code"));
  let isOtpValid=new Date()<findUser.otpExpiresAt;
  console.log({now:new Date,otpExpires:findUser.otpExpiresAt})
  if(!isOtpValid) return next(new ErrorConfig(401,"OTP expires"));
  let verifyAccount=await user.updateOne({otp:req.params.otpCode},{$set:{...findUser,otp:undefined,otpExpiresAt:undefined,isVerified:true}});
  if(verifyAccount){
    let templatePath=path.join(__dirname,"../../../views/welcomeEmailTemplate.ejs");
    type Data={
      user:string;
    }
     let data:Data={
       user:findUser.fname//findOtp contain user data
    }
    ejs.renderFile(templatePath,{data},async function (err,htmlTemplate){
    if(err){
      console.log({error:err});
      throw new Error();
  }
  await sendEmail("welcome Email","welcome Email",findUser.email,htmlTemplate);
    })
  }
  res.json(new ResponseConfig(200,"User verified successfully"));
})
const sendOtpAgain=asyncHandler(async(req,res,next)=>{
  const {email}=req.body;
  const userExist=await user.findOne({email,isVerified:false});
  if(!userExist) return next(new ErrorConfig(400,"Sorry you can't use this service"));
  let otp=generateOtp();
  let hashedOTP=await bcrypt.hash(otp,10);
  let otpExpiresAt=generateOtpExpirationTime();
  console.log({hashedOTP,otpExpiresAt})
  const updateOtp=await user.updateOne(
    {email},
    {$set:{
      otp:hashedOTP,
      otpExpiresAt
    }})
    if(updateOtp?.modifiedCount===0) return next(new ErrorConfig(500,"failed to update OTP"));
    console.log({updateOtp})
  let templatePath=path.join(__dirname,"../../../views/verificationEmailTemplate.ejs");
    type Data={
      user:string;
      otpCode:string | number;
    }
     let data:Data={
       user:userExist.fname,//userExist contain user data
       otpCode:otp
    }
    ejs.renderFile(templatePath,{data},async function (err,htmlTemplate){
    if(err){
      console.log({error:err});
      throw new Error();
  }
  await sendEmail("Verification Email","Verification Email",email,htmlTemplate);
    })
    res.json(new ResponseConfig(200,"OTP sent"));
})
export{
  test,
  userRegistration,
  login,
  loggedOut,
  profileUpdate,
  getAllUsers,
  deleteUserModle,
  verifyOtp,
  sendOtpAgain
}