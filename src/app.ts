import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", uploadRoutes); // Prefijo para los endpoints

app.get("/", (req, res) => {
  res.send("API funcionando");
});

export default app;