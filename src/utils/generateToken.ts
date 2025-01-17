import jwt from "jsonwebtoken";
import {Payload} from "../@types/payload.types";
const generateToken=async(secretkey:string,tokenExpirationTime:number,payload:Payload)=>{
  let token=await jwt.sign(payload,secretkey,{
    expiresIn:tokenExpirationTime
    });
  return token;
}
export default generateToken;