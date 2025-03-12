import { ApiKey, IApiKey } from "../models/ApiKey";
import { v4 as uuidv4 } from "uuid";

export const generateApiKey = async (): Promise<IApiKey> => {
  const newKey = new ApiKey({ key: uuidv4() });
  return await newKey.save();
};

export const getValidApiKeys = async (): Promise<IApiKey[]> => {
  return await ApiKey.find({ active: true });
};

export const validateApiKey = async (key: string): Promise<boolean> => {
  const apiKey = await ApiKey.findOne({ key, active: true });
  return apiKey !== null;
};
