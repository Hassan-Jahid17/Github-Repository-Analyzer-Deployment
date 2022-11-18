import createHttpError from "http-errors";
import { Request, Response, NextFunction, RequestHandler } from 'express';

// 404 not found handler
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(createHttpError(404, "Your requested content was not found!"));
}

// default error handler
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
	console.log(err.message);
	var error =
	  process.env.NODE_ENV === "development" ? err : { message: err.message };
  
	res.status(err.status || 500);
  
	res.json(error);
}
