import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
import mealRoutes from "./routes/mealRoutes";
app.use("/api", mealRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("NutriWise Backend Running (TypeScript)");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
