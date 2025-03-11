import { Request, RequestHandler, Response } from "express";
import { uploadFileUseCase, getStatusUseCase } from "../usecases/uploadUseCase";

export const uploadFileController: RequestHandler = async (req: Request, res: Response) => {
  try {
    const taskId = await uploadFileUseCase();
    res.status(202).json({ taskId, message: "Carga iniciada" });
  } catch (error) {
    console.error("❌ Error en uploadFileController:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getStatusController: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const status = await getStatusUseCase(id);
    res.json({ id, status });
  } catch (error) {
    console.error("❌ Error en getStatusController:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};