import { ApiKeyType } from "../enums/ApiKeys";

export const validateApiKey = (apiKey: string | undefined, keyType: ApiKeyType): boolean => {
  if (!apiKey) return false;
  
  const expectedKey = process.env[keyType]; // Accede a la variable de entorno dinámica
  
  return apiKey === expectedKey;
};
