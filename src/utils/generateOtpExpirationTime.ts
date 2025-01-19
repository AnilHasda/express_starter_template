const generateOtpExpirationTime=()=>{
const expireTime=new Date(Date.now()+60*1000).toISOString;
return expireTime;
}
export default generateOtpExpirationTime;