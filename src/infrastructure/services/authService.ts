import { ApiKeyType } from "../../enums/ApiKeys";

export const validateApiKey = (apiKey: string | undefined, keyType: ApiKeyType): boolean => {
  if (!apiKey) return false;
  
  const expectedKey = process.env[keyType];
  
  return apiKey === expectedKey;
};
