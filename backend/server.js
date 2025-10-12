import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ===== Environment & DB =====
const isProd = process.env.NODE_ENV === "production";
const DATABASE_URL = process.env.DATABASE_URL; // single source for both local and prod

// Initialize Prisma
const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

// ===== CORS =====
const allowedOrigins = [
  "http://localhost:3000",
  "https://ccsharon26.github.io",
  "https://ccsharon26.github.io/CutWaterz"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman or mobile
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: The origin ${origin} is not allowed`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));

app.use(express.json());

// ===== Health Check =====
app.get("/api/ping", (req, res) => res.json({ ok: true }));

// ===== Products =====
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ===== Sales =====
app.get("/api/sales", async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: { SaleItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

// ===== Record Sale =====
app.post("/api/sales", async (req, res) => {
  const { items, total } = req.body;
  try {
    const sale = await prisma.sale.create({
      data: {
        total,
        SaleItems: {
          create: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          }))
        }
      },
      include: { SaleItems: { include: { product: true } } },
    });

    // Update stock & movements
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } }
      });
      await prisma.stockMovement.create({
        data: { productId: item.id, quantity: item.quantity, type: "OUT" }
      });
    }

    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record sale" });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} | DB: ${isProd ? "Production" : "Development"}`);
});
