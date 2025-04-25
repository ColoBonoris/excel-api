export class JobError {
    constructor (
        public readonly id: string,
        public row: number,
        public col: number,
    ) {}
}