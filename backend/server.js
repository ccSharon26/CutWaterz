import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import salesRoutes from "./routes/salesRoutes.js";
import { connectDB } from "./models/Index.js";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// ⚡ CORS configuration
app.use(cors({
  origin: ["https://ccsharon26.github.io", "http://localhost:3000"], 
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 4000;

await connectDB(); // initialize DB

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
