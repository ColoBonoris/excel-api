import { Request, Response, NextFunction } from "express";
import { validateApiKey } from "../repositories/apiKeyRepository";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ error: "API Key requerida" });
  }

  const isValid = await validateApiKey(apiKey);
  if (!isValid) {
    return res.status(403).json({ error: "API Key inválida o inactiva" });
  }

  next();
};