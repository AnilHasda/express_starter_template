import nodemailer from "nodemailer";
// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(subject:string,text:string,receiver_id:string,htmlTemplate:string) {
  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_ADMIN as string,
    pass: process.env.EMAIL_PASSWORD as string,
  },
});
  console.log({email:process.env.EMAIL_ADMIN,
    pass: process.env.EMAIL_PASSWORD})
  try{
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Sarkar Hasda" <hasdaanil098@gmail.com>', // sender address
    to: receiver_id, // list of receivers
    subject, // Subject line
    text, // plain text body
    html:htmlTemplate, // html body
  });

  console.log("Message sent");
  }catch(error){
    console.log({error})
    throw new Error("something went wrong");
  }
}
export default sendEmail;

