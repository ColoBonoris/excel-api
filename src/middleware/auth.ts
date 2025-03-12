import { Request, Response, NextFunction, RequestHandler } from "express";
import { validateApiKey } from "../repositories/apiKeyRepository";

export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    res.status(401).json({ error: "API Key required" });
  }

  const isValid = await validateApiKey(apiKey);
  if (!isValid) {
    res.status(403).json({ error: "Received API Key is either not valid or not active" });
  }

  next();
};