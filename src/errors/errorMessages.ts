import { ErrorType } from "../enums/errorTypes";

export const ERROR_DEFINITIONS: Record<
  ErrorType,
  { statusCode: number; message: string }
> = {
  [ErrorType.VALIDATION_ERROR]: {
    statusCode: 400,
    message: "Validation failed",
  },
  [ErrorType.NOT_FOUND]: { statusCode: 404, message: "Resource not found" },
  [ErrorType.UNAUTHORIZED]: { statusCode: 401, message: "Unauthorized access" },
  [ErrorType.FORBIDDEN]: { statusCode: 403, message: "Access is forbidden" },
  [ErrorType.DATABASE_ERROR]: {
    statusCode: 503,
    message: "Database connection error",
  },
  [ErrorType.UNKNOWN_ERROR]: {
    statusCode: 500,
    message: "An unexpected error occurred",
  },
  [ErrorType.SERVICE_UNAVAILABLE]: {
    statusCode: 503,
    message: "Service unavailable",
  },
  [ErrorType.QUEUE_ERROR]: {
    statusCode: 500,
    message: "Queue processing error",
  },
  [ErrorType.FILE_PROCESSING_ERROR]: {
    statusCode: 500,
    message: "File processing error",
  },
  [ErrorType.FORMAT_ERROR]: {
    statusCode: 400,
    message: "Only .xlsx files are allowed",
  },
};
