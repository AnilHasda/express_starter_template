import {Request,Response,NextFunction} from "express";
type funcType=(req:Request,res:Response,next:NextFunction)=>Promise<Response | void>
/*const asyncHandler=(func:funcType)=>(req:Request,res:Response,next:NextFunction)=>{
  Promise.resolve(func(req,res,next)).catch(next)
  }*/
const asyncHandler=(func:funcType)=>async (req:Request,res:Response,next:NextFunction)=>{
  try{
  await func(req,res,next);
  }catch(error){
    console.log(JSON.stringify(error,null,2));
    next(error);
  }
}

export default asyncHandler;