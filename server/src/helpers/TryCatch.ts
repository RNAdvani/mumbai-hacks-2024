import { NextFunction, Response,Request } from "express";

export type FunctionType = (req: Request, res: Response,next:NextFunction) => Promise<any>;

export const TryCatch = (fn: FunctionType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};