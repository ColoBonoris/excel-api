import { inject, injectable } from 'tsyringe';
import { IQueueService } from '../../domain/repositories/IQueueService';
import { IJobRepository } from '../../domain/repositories/IJobRepository';
import { Job } from '../../domain/entities/Job';
import { v4 as uuidv4 } from 'uuid';
  
@injectable()
export class UploadFileUseCase {
    constructor(
        @inject('QueueService') private queueService: IQueueService,
        @inject('JobRepository') private jobRepository: IJobRepository
    ) {}
  
    async execute(file: Buffer): Promise<string> {
        const jobId = uuidv4();
        const job = new Job(jobId, 'queued');
        await this.jobRepository.save(job);
        await this.queueService.publish(jobId, file);
        return jobId;
    }
}