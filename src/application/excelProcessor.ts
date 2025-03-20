import fs from "fs";
import path from "path";
import { updateJob } from "../infrastructure/database/repositories/uploadRepository";
import { parseMapping } from "../utils/parseMapping";
import {
  insertChunk,
  CHUNK_SIZE_RESULT,
  CHUNK_SIZE_ERRORS
} from "../infrastructure/database/repositories/jobDataRepository";
import { ErrorEntry } from "../infrastructure/database/models/Error";

const ExcelJS = require("exceljs");

/**
 * processExcelFile:
 * - Ignora el header del Excel (fila #1)
 * - Usa indices de columna para parsear celdas (col0..colN)
 * - Almacena filas y errores en chunking.
 */
export async function processExcelFile(
  jobId: string,
  filePath: string,
  rawMapping: Record<number, string> // e.g. {0:"String",1:"Number",2:"Number",...}
) {
  // Marcamos "processing"
  await updateJob(jobId, { status: "processing" });

  try {
    // 1) parseMapping -> crea mappingFunctions[c] para c=0..n-1
    const mappingFunctions = parseMapping(rawMapping);
    const numCols = Object.keys(mappingFunctions).length;

    const fullPath = path.resolve(filePath);
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(fullPath, {
      entries: "emit",
      sharedStrings: "cache",
      worksheets: "emit",
    });

    // Buffers y logica de chunk
    let resultBuffer: any[] = [];
    let errorBuffer: any[] = [];
    let resultChunkIdx = 0;
    let errorChunkIdx = 0;

    let headerSkipped = false; // Para saltar la 1ra fila (header) si no lo usas

    workbookReader.on("worksheet", (worksheet: any) => {
      worksheet.on("row", (row: any) => {
        const rowIndex = row.number;
        const rowData = row.values; // [undef, cell1, cell2, ...]

        console.log("Row", rowIndex, rowData)

        // Saltar la primera fila si no quieres usarla
        if (!headerSkipped) {
          headerSkipped = true;
          return;
        }

        // Para cada fila real
        const rowObj: Record<string, any> = {};
        const rowErrors: ErrorEntry[] = [];

        // Recorremos 0..(numCols-1)
        for (let c = 0; c < numCols; c++) {


          const converter = mappingFunctions[c];
          const cellValue = rowData[c + 1]; // c+1 => en row.values

          console.log(converter);
          console.log(cellValue);
          
          

          if (!converter) {
            // no hay converter -> error en esa celda
            rowObj[`col${c}`] = undefined;
            rowErrors.push({ col: c + 1, row: rowIndex });
            continue;
          }

          const { value, error } = converter(cellValue);
          if (error) {
            // Celda con error => undefined
            rowObj[`col${c}`] = undefined;
            rowErrors.push({ col: c + 1, row: rowIndex });
          } else {
            rowObj[`col${c}`] = value;
          }
        }

        // Agregamos la fila con celdas undefined en resultBuffer
        resultBuffer.push(rowObj);
        if (resultBuffer.length >= CHUNK_SIZE_RESULT) {
          insertChunk(jobId, false, resultChunkIdx, resultBuffer);
          resultChunkIdx++;
          resultBuffer = [];
        }

        // Guardamos los errores de celda
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
      // Volcar buffers pendientes
      if (resultBuffer.length > 0) {
        await insertChunk(jobId, false, resultChunkIdx, resultBuffer);
      }
      if (errorBuffer.length > 0) {
        await insertChunk(jobId, true, errorChunkIdx, errorBuffer);
      }
      // Marcamos "done"
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
