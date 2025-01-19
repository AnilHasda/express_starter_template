import {Request,Response,NextFunction} from "express";
import user from "../../models/authModel";
import ErrorConfig from "../../helpers/errorConfig";
const isAuthenticated=(roles:string[])=>{
  return async(req:Request,res:Response,next:NextFunction)=>{
    try{
    let userExist=await user.findOne({email:req.email}).select("-password");
    if(!userExist) throw new ErrorConfig(401,"sorry! you are not authonticate to access this service !!");
    const {role}=userExist;
    if(roles.includes(role)) next();
    else throw new ErrorConfig(401,"sorry! you are not authonticate to access this service !!");
  }catch(error){
    throw new Error();
  }
  }
}
export {isAuthenticated};