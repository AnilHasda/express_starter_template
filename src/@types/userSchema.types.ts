export interface UserSchema{
  firstname:string;
  lastname:string;
  email:string;
  password:string;
  profile?:string;
  refresh_token:string;
  role:string;
  otp?:string;
  otpExpiresAt?:Date;
  isVerified:boolean;
}