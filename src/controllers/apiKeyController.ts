import { Request, Response } from "express";
import { createApiKey, listApiKeys } from "../usecases/apiKeyUseCase";

export const generateNewApiKey = async (req: Request, res: Response): Promise<void> => {
  const apiKey = await createApiKey();
  res.json({ apiKey: apiKey.key });
};

export const listAllApiKeys = async (req: Request, res: Response): Promise<void> => {
  const apiKeys = await listApiKeys();
  res.json(apiKeys.map(key => ({ key: key.key, createdAt: key.createdAt })));
};