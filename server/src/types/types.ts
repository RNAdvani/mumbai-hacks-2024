import { NextFunction, Request, Response } from "express"

export type funcType = (req:Request,res:Response,next:NextFunction)=> Promise<Response<any,Record<string,any>>|any >