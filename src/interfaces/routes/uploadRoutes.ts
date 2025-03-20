import express from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploadController";
import { getStatus } from "../controllers/statusController";
import { authMiddleware } from "../../middleware/auth";
import { ApiKeyType } from "../../enums/ApiKeys";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an XLSX file for processing
 *     tags: [Uploads]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               mapping:
 *                 type: string
 *                 example: '{"name":"String","age":"Number","nums":"Array<Number>"}'
 *                 description: JSON object with column mapping (must be a valid JSON string)
 *     responses:
 *       200:
 *         description: Returns a job ID
 *       400:
 *         description: File and mapping are required
 *       401:
 *         description: API Key is required
 *       403:
 *         description: Invalid API Key
 */
router.post(
  "/upload",
  authMiddleware(ApiKeyType.UPLOAD),
  upload.single("file"),
  uploadFile,
);

/**
 * @swagger
 * /status/{jobId}:
 *   get:
 *     summary: Get the status (and optional paginated chunks) of a processed file
 *     tags: [Uploads]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the job to check
 *       - in: query
 *         name: resultPage
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 1-based page index for the result data chunk (100 rows per page)
 *       - in: query
 *         name: errorPage
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 1-based page index for the error data chunk (1,000 rows per page)
 *     responses:
 *       200:
 *         description: Returns the job status. If the job is done, returns the requested page of result/error data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The current job status (e.g., pending, processing, done, failed)
 *                 resultPage:
 *                   type: integer
 *                   description: Page index requested for result chunk
 *                 errorPage:
 *                   type: integer
 *                   description: Page index requested for error chunk
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Array of result rows for this page
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Array of error rows for this page
 *       401:
 *         description: API Key is required
 *       403:
 *         description: Invalid API Key
 *       404:
 *         description: Job not found
 */
router.get("/status/:jobId", authMiddleware(ApiKeyType.STATUS), getStatus);

export default router;
