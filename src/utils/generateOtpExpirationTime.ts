const generateOtpExpirationTime=()=>{
const expireTime=new Date(Date.now()+(2*60*1000));
return expireTime;
}
export default generateOtpExpirationTime;