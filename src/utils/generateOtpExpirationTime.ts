const generateOtpExpirationTime=(expirationTime=2)=>{
const expireTime=new Date(Date.now()+expirationTime*60*1000);
return expireTime;
}
export default generateOtpExpirationTime;