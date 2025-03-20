import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "./AppError";
import { ErrorType } from "../enums/errorTypes";

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.type, message: err.message });
    return;
  }

  res.status(500).json({
    error: ErrorType.UNKNOWN_ERROR,
    message: "An unexpected error occurred",
  });
};
