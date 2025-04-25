import { Job } from "../entities/Job";

export interface IJobRepository {
    save(job: Job): Promise<void>;
    updateStatus(id: string, status: Job['status']): Promise<void>;
    updateErrors(id: string, errors: Job['errors']): Promise<void>;
    saveResult(id: string, result: any, errors: Job['errors']): Promise<void>;
    finishJob(id:string, result: any, errors: Job['errors']): Promise<void>;
    getById(id: string): Promise<Job | null>;
    deleteById(id: string): Promise<void>;
    getAll(): Promise<Job[]>;
    getByReferenceId(referenceId: string): Promise<Job | null>;
}