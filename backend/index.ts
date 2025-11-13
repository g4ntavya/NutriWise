import express from "express";
import dotenv from "dotenv";
import mealRoutes from "./routes/mealRoutes";

// Use CommonJS require for cors to avoid missing type declarations
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", mealRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
