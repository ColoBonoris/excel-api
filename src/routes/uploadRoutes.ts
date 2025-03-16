import express from "express";
import multer from "multer";
import { uploadFile, getStatus } from "../controllers/uploadController";
import { authMiddleware } from "../middleware/auth";
import { ApiKeyType } from "../enums/ApiKeys";

const router = express.Router();

// Set up Multer to handle file uploads
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
router.post("/upload", authMiddleware(ApiKeyType.UPLOAD), upload.single("file"), uploadFile);

/**
 * @swagger
 * /status/{jobId}:
 *   get:
 *     summary: Get the status of a processed file
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
 *     responses:
 *       200:
 *         description: Returns the job status and errors/results if completed
 *       401:
 *         description: API Key is required
 *       403:
 *         description: Invalid API Key
 *       404:
 *         description: Job not found
 */
router.get("/status/:jobId", authMiddleware(ApiKeyType.STATUS), getStatus);

export default router;
