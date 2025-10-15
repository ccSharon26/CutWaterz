import express from "express";
import { Product } from "../models/Index.js";

const router = express.Router();

// Add new product
router.post("/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Add stock to existing product
router.patch("/products/:id/stock", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Increment stock by qty from body
    product.stock += Number(req.body.qty);
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product price (Admin only)
router.patch("/products/:id/price", async (req, res) => {
  try {
    const { price } = req.body;
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Update price
    product.price = parseFloat(price);
    await product.save();

    res.json({ message: "Price updated successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Delete product
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
