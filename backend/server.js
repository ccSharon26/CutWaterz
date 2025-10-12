import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const DATABASE_URL = isProd ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL;
const DATABASE_PROVIDER = isProd ? process.env.DATABASE_PROVIDER_PROD : process.env.DATABASE_PROVIDER;

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://ccsharon26.github.io", 
      "https://ccsharon26.github.io/CutWaterz", 
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});



console.log("Server running with:", {
  env: process.env.NODE_ENV,
  dbUrl: DATABASE_URL,
  provider: DATABASE_PROVIDER
});

// ===== Health Check =====
app.get("/api/ping", (req, res) => res.json({ ok: true }));

// ===== Products =====
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/products", async (req, res) => {
  const { name, price, stock } = req.body;
  try {
    const product = await prisma.product.create({
      data: { name, price: parseFloat(price), stock: parseInt(stock) || 0 },
    });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/products/:id", async (req, res) => {
  const { name, price, stock } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { name, price: parseFloat(price), stock: parseInt(stock) },
    });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sales", async (req, res) => {
  const { items, total } = req.body;
  try {
    const sale = await prisma.sale.create({
      data: {
        total,
        SaleItems: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: { SaleItems: { include: { product: true } } },
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } },
      });
      await prisma.stockMovement.create({
        data: { productId: item.id, quantity: item.quantity, type: "OUT" },
      });
    }

    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record sale" });
  }
});

// ===== Stock Movement =====
app.get("/api/stock-movements", async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(movements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stock-in", async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const movement = await prisma.stockMovement.create({
      data: { productId: parseInt(productId), quantity: parseInt(quantity), type: "IN" },
    });
    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { stock: { increment: parseInt(quantity) } },
    });
    res.json(movement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stock-out", async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ error: "Not enough stock" });

    await prisma.stockMovement.create({
      data: { productId: parseInt(productId), quantity: parseInt(quantity), type: "OUT" },
    });

    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { stock: { decrement: parseInt(quantity) } },
    });

    res.json({ message: "Stock reduced" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT} | DB: ${isProd ? "Production" : "Development"}`)
);
