import crypto from "crypto";
import bcrypt from "bcryptjs";
const generateOtp=()=>{
  let otp=crypto.randomInt(100000,999999).toString();
  return otp;
}
export default generateOtp;