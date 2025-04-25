import { JobError } from "./JobError";

export class Job {
    constructor (
        public readonly referenceId: string,
        public status: 'queued' | 'processing' | 'finished' | 'error',
        public result: any = null,
        public errors: JobError[] = []
    ) {}
    
}