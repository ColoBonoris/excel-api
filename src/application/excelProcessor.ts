// src/usecases/processExcelFile.ts
import fs from "fs";
import path from "path";
import { updateJob } from "../infrastructure/database/repositories/uploadRepository";
import { parseMapping, MappingItem } from "../utils/parseMapping";
import {
  insertChunk,
  CHUNK_SIZE_RESULT,
  CHUNK_SIZE_ERRORS
} from "../infrastructure/database/repositories/jobDataRepository";
import { ErrorEntry } from "../infrastructure/database/models/Error";

const ExcelJS = require("exceljs");

/**
 * - Ignora el header del Excel (fila #1)
 * - Usa la orden de `rawMapping` para parsear celdas
 * - Almacena filas y errores en chunking,
 *   pero con las keys definidas en rawMapping (ej "name","age","nums")
 */
export async function processExcelFile(
  jobId: string,
  filePath: string,
  rawMapping: Record<string, string> // e.g. { name:"String", age:"Number", nums:"Array<Number>" }
) {
  // Marcamos "processing"
  await updateJob(jobId, { status: "processing" });

  try {
    // parseMapping => array: [ { key: "name", parseFn }, { key: "age", parseFn }, ... ]
    const mappingArray: MappingItem[] = parseMapping(rawMapping);
    const numCols = mappingArray.length;

    const fullPath = path.resolve(filePath);
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(fullPath, {
      entries: "emit",
      sharedStrings: "cache",
      worksheets: "emit",
    });

    // Buffers y chunk logic
    let resultBuffer: any[] = [];
    let errorBuffer: any[] = [];
    let resultChunkIdx = 0;
    let errorChunkIdx = 0;

    let headerSkipped = false; // saltamos la 1ra fila

    workbookReader.on("worksheet", (worksheet: any) => {
      worksheet.on("row", (row: any) => {
        const rowIndex = row.number;
        const rowData = row.values; // [undef, cell1, cell2, cell3...]

        // Saltar la primera fila
        if (!headerSkipped) {
          headerSkipped = true;
          return;
        }

        const rowObj: Record<string, any> = {};
        const rowErrors: ErrorEntry[] = [];

        // Recorremos mappingArray para parsear cada columna
        for (let c = 0; c < numCols; c++) {
          const { key, parseFn } = mappingArray[c];
          // rowData[c+1] => la celda real
          const cellValue = rowData[c + 1];

          if (!parseFn) {
            rowObj[key] = undefined;
            rowErrors.push({ col: c + 1, row: rowIndex });
            continue;
          }

          const { value, error } = parseFn(cellValue);
          if (error) {
            rowObj[key] = undefined;
            rowErrors.push({ col: c + 1, row: rowIndex });
          } else {
            rowObj[key] = value;
          }
        }

        // Agregamos la fila en resultBuffer
        resultBuffer.push(rowObj);
        if (resultBuffer.length >= CHUNK_SIZE_RESULT) {
          insertChunk(jobId, false, resultChunkIdx, resultBuffer);
          resultChunkIdx++;
          resultBuffer = [];
        }

        // Agregamos errores de celda
        if (rowErrors.length > 0) {
          rowErrors.forEach(err => errorBuffer.push(err));
          if (errorBuffer.length >= CHUNK_SIZE_ERRORS) {
            insertChunk(jobId, true, errorChunkIdx, errorBuffer);
            errorChunkIdx++;
            errorBuffer = [];
          }
        }
      });

      worksheet.on("end", () => {
        console.log(`✅ Finished reading worksheet: ${worksheet.name}`);
      });
    });

    workbookReader.on("error", async (err: any) => {
      console.error("Error reading Excel in streaming:", err);
      await updateJob(jobId, { status: "failed" });
      cleanupFile(fullPath);
    });

    workbookReader.on("end", async () => {
      // Vaciamos buffers
      if (resultBuffer.length > 0) {
        await insertChunk(jobId, false, resultChunkIdx, resultBuffer);
      }
      if (errorBuffer.length > 0) {
        await insertChunk(jobId, true, errorChunkIdx, errorBuffer);
      }
      await updateJob(jobId, { status: "done" });
      cleanupFile(fullPath);
    });

    workbookReader.read();
  } catch (error) {
    console.error("Error processing file:", error);
    await updateJob(jobId, { status: "failed" });
    cleanupFile(filePath);
  }
}

function cleanupFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("🗑️ Deleted file:", filePath);
  }
}
