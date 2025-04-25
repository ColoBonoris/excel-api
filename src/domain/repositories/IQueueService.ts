export interface IQueueService {
    publish(jobId: string, file: Buffer): Promise<void>;
}