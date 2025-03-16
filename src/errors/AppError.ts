import { ErrorType } from "../enums/errors";

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;

  constructor(type: ErrorType, message: string, statusCode: number = 500) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
  }
}