import { Request, Response, NextFunction } from "express";
import { validateApiKey } from "../infrastructure/services/authService";
import { ApiKeyType } from "../enums/ApiKeys";
import { AppError } from "../errors/AppError";
import { ErrorType } from "../enums/errorTypes";

export const authMiddleware = (keyType: ApiKeyType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      return next(new AppError(ErrorType.UNAUTHORIZED));
    }

    if (!validateApiKey(apiKey, keyType)) {
      return next(new AppError(ErrorType.FORBIDDEN));
    }

    next();
  };
};
