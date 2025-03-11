import { getUploadStatus, saveUploadTask } from "../repositories/uploadRepository";

export const uploadFileUseCase = async (): Promise<string> => {
    // Queuing the task
    saveUploadTask("taskId");
    // Simulación: Generar un ID aleatorio y devolverlo
    return Math.random().toString(36).substring(7);
};

export const getStatusUseCase = async (taskId: string): Promise<string> => {
    // getting the task status
    getUploadStatus(taskId);
    // Simulación: Retornar un estado aleatorio
    const statuses = ["pending", "processing", "done"];
    return statuses[Math.floor(Math.random() * statuses.length)];
};
  