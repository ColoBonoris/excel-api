import express from "express";
import { uploadFile, getStatus } from "../controllers/uploadController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

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
 *                 description: JSON object with column mapping
 *     responses:
 *       200:
 *         description: Returns a job ID
 *       401:
 *         description: API Key is required
 *       403:
 *         description: Invalid API Key
 */
router.post("/upload", authMiddleware, uploadFile);

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
router.get("/status/:jobId", authMiddleware, getStatus);

export default router;
