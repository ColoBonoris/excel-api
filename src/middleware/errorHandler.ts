import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { ErrorType } from "../enums/errors";

/**
 * Global error handler middleware
 */
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): Response | void => {
    const errorMessage = err instanceof Error ? err.message : String(err);
  
    console.error(`❌ Error: ${errorMessage}`);
  
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.type, message: err.message });
    }
  
    return res.status(500).json({
      error: ErrorType.UNKNOWN_ERROR,
      message: "An unexpected error occurred.",
    });
};
