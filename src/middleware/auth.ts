import { Request, Response, NextFunction } from "express";
import { validateApiKey } from "../infrastructure/services/authService";
import { ApiKeyType } from "../enums/ApiKeys";
import { AppError } from "../errors/AppError";
import { ErrorType } from "../enums/errors";

export const authMiddleware = (keyType: ApiKeyType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header("x-api-key");

    if (!validateApiKey(apiKey, keyType)) {
      throw new AppError(ErrorType.UNAUTHORIZED, "Invalid API Key", 401);
    }

    next();
  };
};
