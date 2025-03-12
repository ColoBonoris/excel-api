import { generateApiKey, getValidApiKeys } from "../repositories/apiKeyRepository";

export const createApiKey = async () => {
  return await generateApiKey();
};

export const listApiKeys = async () => {
  return await getValidApiKeys();
};