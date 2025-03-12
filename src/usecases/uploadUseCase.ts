import xlsx from "xlsx";
import fs from "fs";
import { updateJob } from "../repositories/uploadRepository";

//import { getUploadStatus, saveUploadTask } from "../repositories/uploadRepository";
// export const uploadFileUseCase = async (): Promise<string> => {
//     // Queuing the task
//     queueFileUpload();
//     // Simulación: Generar un ID aleatorio y devolverlo
//     return taskId;
// };

// export const getStatusUseCase = async (taskId: string): Promise<string> => {
//     // getting the task status
//     getUploadStatus(taskId);
//     // Simulación: Retornar un estado aleatorio
//     const statuses = ["pending", "processing", "done"];
//     return statuses[Math.floor(Math.random() * statuses.length)];
// };

// Another solution ---------------------------------------------

interface Mapping {
  [key: string]: string;
}

export const processFile = async (jobId: string, filePath: string, mapping: Mapping): Promise<void> => {
  await updateJob(jobId, { status: "processing" });

  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { raw: false });

    let errors: { col: string; row: number }[] = [];
    let transformedData: any[] = [];

    data.forEach((row: any, rowIndex: number) => {
      let transformedRow: Record<string, any> = {};
      let hasError = false;

      Object.keys(mapping).forEach((col) => {
        if (!row[col]) {
          errors.push({ col, row: rowIndex });
          hasError = true;
        }
        transformedRow[mapping[col]] = row[col] || null;
      });

      if (!hasError) {
        transformedData.push(transformedRow);
      }
    });

    await updateJob(jobId, {
      status: "done",
      jobErrors: errors.length > 0 ? errors : undefined,
      result: transformedData.length > 0 ? { data: transformedData } : undefined
    });

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error procesando archivo:", error);
    await updateJob(jobId, { status: "failed" });
  }
};

  