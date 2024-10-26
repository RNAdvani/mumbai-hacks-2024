import { NextFunction, Response ,Request} from 'express'

export class ErrorHandler extends Error{
  constructor(public statusCode: number, public message: string){
      super();
      this.message = message;
      this.statusCode = statusCode;
  }
}

const errorResponse = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Something went wrong';

  next(res.status(err.statusCode).json({
      success: false,
      message: err.message
  }));
}

export default errorResponse
