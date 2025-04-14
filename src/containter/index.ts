// src/container/index.ts
import { container } from "tsyringe";
import { UploadService } from "../infrastructure/services/UploadService";
import { IUploadService } from "../domain/services/IUploadService";

container.register<IUploadService>("UploadService", {
  useClass: UploadService,
});