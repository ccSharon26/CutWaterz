import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/adminRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { connectDB } from "./models/Index.js";

dotenv.config();
const app = express();

// --------------------
// CORS: Allow GitHub Pages and localhost
// --------------------
app.use(cors({
  origin: [
    "https://ccsharon26.github.io",
    "http://localhost:3000"  // your dev frontend
  ],
  credentials: true
}));

// --------------------
// JSON parser
// --------------------
app.use(express.json());

// --------------------
// Routes
// --------------------
app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/products", productRoutes);

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 4000;

await connectDB(); // initialize DB

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
