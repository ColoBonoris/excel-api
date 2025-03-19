import { ErrorType } from "../enums/errorTypes";
import { ERROR_DEFINITIONS } from "./errorMessages";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly type: ErrorType;

  constructor(type: ErrorType) {
    super(ERROR_DEFINITIONS[type].message);
    this.statusCode = ERROR_DEFINITIONS[type].statusCode;
    this.type = type;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
