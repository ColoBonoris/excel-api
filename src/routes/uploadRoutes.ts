import { Router } from "express";
import { getStatusController, uploadFileController } from "../controllers/uploadController";

const router = Router();

router.post("/upload", uploadFileController);
router.get("/status/:id", getStatusController);

export default router;