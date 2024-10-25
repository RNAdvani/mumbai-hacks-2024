
import { NextFunction,Request,Response } from "express";
import { funcType } from "../types/types";
export const TryCatch = (func:funcType)=>(req:Request,res:Response,next:NextFunction)=>{
    return Promise.resolve(func(req,res,next)).catch(next)
}