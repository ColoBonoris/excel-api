import { container } from 'tsyringe';
import { IJobRepository } from '../domain/repositories/IJobRepository';
import { IQueueService } from '../domain/repositories/IQueueService';
import { RabbitMQQueueService } from '../infrastructure/services/RabbitMQQueueService';
import { JobRepository } from '../infrastructure/database/repositories/JobRepository';

container.register<IJobRepository>('JobRepository', {
  useClass: JobRepository,
});

container.register<IQueueService>('QueueService', {
  useClass: RabbitMQQueueService,
});