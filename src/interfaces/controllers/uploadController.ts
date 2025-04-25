import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UploadFileUseCase } from '../../application/usecases/UploadFileUseCase';
import { AppError } from '../../errors/AppError';
import { ErrorType } from '../../enums/errorTypes';
import { asyncHandler } from '../middleware/asyncHandler';

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file || !req.body.mapping) {
    throw new AppError(ErrorType.VALIDATION_ERROR);
  }

  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  if (
    !allowedMimeTypes.includes(req.file.mimetype) ||
    !req.file.originalname.endsWith('.xlsx')
  ) {
    throw new AppError(ErrorType.FORMAT_ERROR);
  }

  let parsedMapping;
  try {
    parsedMapping =
      typeof req.body.mapping === 'string'
        ? JSON.parse(req.body.mapping)
        : req.body.mapping;
  } catch {
    throw new AppError(ErrorType.VALIDATION_ERROR);
  }

  const useCase = container.resolve(UploadFileUseCase);
  const jobId = await useCase.execute(req.file.buffer);
  res.status(202).json({ jobId });
});