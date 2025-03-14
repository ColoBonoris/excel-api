import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes";
import { setupSwagger } from "./config/swagger";



dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", uploadRoutes); // endpoints prefix

app.get("/", (req, res) => {
  res.send("API up and working");
});

// Configurar Swagger
setupSwagger(app);

export default app;


// const app = express();
// app.use(express.json());

// app.use("/api", uploadRoutes);


// connectDB().then(() => {
//   app.listen(3000, () => console.log("🚀 API running in PORT 3000"));
// });