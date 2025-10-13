import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/adminroutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import { connectDB } from "./models/Index.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 4000;

await connectDB(); // initialize DB

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
