import { errorMiddleware } from "../../middleware/errorHandler";
import { AppError } from "../../errors/AppError";
import { ErrorType } from "../../enums/errorTypes";
import { Request, Response } from "express";

describe("errorHandler", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return correct status for AppError", () => {
    const error = new AppError(ErrorType.VALIDATION_ERROR);
    errorMiddleware(error, mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: ErrorType.VALIDATION_ERROR, message: "Validation failed" });
  });

  it("should return 500 for unknown errors", () => {
    const error = new Error("Unexpected error");
    errorMiddleware(error, mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: ErrorType.UNKNOWN_ERROR, message: "An unexpected error occurred" });
  });
});
