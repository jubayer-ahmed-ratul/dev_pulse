import type { NextFunction, Request, Response } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err,
  });
};

export default errorHandler;
