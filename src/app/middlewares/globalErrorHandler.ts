import { NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const statusCode = err.statusCode
  // console.log(statusCode);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong",
    error: err,
  });
};

export default globalErrorHandler;
