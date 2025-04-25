// src/usecases/processExcelFile.ts
import fs from "fs";
import path from "path";
import { parseMapping, MappingItem } from "../utils/parseMapping";
import {
  insertChunk,
  CHUNK_SIZE_RESULT,
  CHUNK_SIZE_ERRORS,
} from "../../infrastructure/database/repositories/JobDataRepository";
import { ErrorModel } from "../../infrastructure/database/models/ErrorModel";

const ExcelJS = require("exceljs");

/**
 * - Ignores header (line 1)
 * - Uses rawmapping order for parsing
 * - Storages results and errors in chunks using row and column indexes
 */
export async function processExcelFile(
  jobId: string,
  filePath: string,
  rawMapping: Record<string, string>, // e.g. { name:"String", age:"Number", nums:"Array<Number>" }
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

    // Buffers & chunk logic
    let resultBuffer: any[] = [];
    let errorBuffer: any[] = [];
    let resultChunkIdx = 0;
    let errorChunkIdx = 0;

    let headerSkipped = false; // skip first row

    workbookReader.on("worksheet", (worksheet: any) => {
      worksheet.on("row", (row: any) => {
        const rowIndex = row.number;
        const rowData = row.values; // [undef, cell1, cell2, cell3...]

        // If header row, skip it
        if (!headerSkipped) {
          headerSkipped = true;
          return;
        }

        const rowObj: Record<string, any> = {};
        const rowErrors: ErrorModel[] = [];

        // Iteration over columns for parsing
        for (let c = 0; c < numCols; c++) {
          const { key, parseFn } = mappingArray[c];
          // rowData[c+1] => real cell
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

        // adding result to buffer
        resultBuffer.push(rowObj);
        if (resultBuffer.length >= CHUNK_SIZE_RESULT) {
          insertChunk(jobId, false, resultChunkIdx, resultBuffer);
          resultChunkIdx++;
          resultBuffer = [];
        }

        // adding errors to buffer
        if (rowErrors.length > 0) {
          rowErrors.forEach((err) => errorBuffer.push(err));
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
      // emptying buffers
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
