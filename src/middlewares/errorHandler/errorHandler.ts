import {Request,Response,NextFunction} from "express";
interface CustomError{
  status:number;
  message:string;
  success:boolean;
}
const errorHandler=(err:CustomError,req:Request,res:Response,next:NextFunction)=>{
  let status=err.status || 500;
  let message=err.message || "something went wrong";
  let success=err.success || false;
  res.status(status).json({status,message,success})
}
export {errorHandler};