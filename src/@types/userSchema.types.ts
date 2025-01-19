export interface UserSchema{
  fname:string;
  lname:string;
  email:string;
  password:string;
  profile?:string;
  refresh_token:string;
  role:string;
  otp?:string;
  otpExpiresAt?:Date;
  isVerified:boolean;
}