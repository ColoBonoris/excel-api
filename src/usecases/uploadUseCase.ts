import xlsx from "xlsx";
import fs from "fs";
import { updateJob } from "../repositories/uploadRepository";

interface MappingFunction {
  [key: string]: (value: any) => any;
}

export const processFile = async (jobId: string, filePath: string, mapping: MappingFunction): Promise<void> => {
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
        const converter = mapping[col];
        const originalValue = row[col];

        const convertedValue = converter ? converter(originalValue) : originalValue;
        if (convertedValue === null || convertedValue === undefined) {
          errors.push({ col, row: rowIndex });
          hasError = true;
        } else {
          transformedRow[col] = convertedValue;
        }
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
    console.error("Error processing file:", error);
    await updateJob(jobId, { status: "failed" });
  }
};
