import express from "express";
import { Sale, SaleItem, Product } from "../models/Index.js";

const router = express.Router();

// Record a sale
router.post("/", async (req, res) => {
  try {
    const { items, total, paymentMethod } = req.body; // NEW

    // Create the sale
    const sale = await Sale.create({ total, paymentMethod }); // UPDATED

    // Create sale items and reduce product stock
    for (const item of items) {
      await SaleItem.create({
        quantity: item.quantity,
        productId: item.id,
        saleId: sale.id,
      });

      const product = await Product.findByPk(item.id);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Fetch the sale with items and products included
    const saleWithItems = await Sale.findByPk(sale.id, {
      include: [
        {
          model: SaleItem,
          include: [Product],
        },
      ],
    });

    res.json(saleWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all sales with items and products
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        {
          model: SaleItem,
          include: [Product],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete all sales (use carefully)
router.delete("/delete-all", async (req, res) => {
  try {
    await SaleItem.destroy({ where: {} });
    await Sale.destroy({ where: {} });
    res.json({ message: "All sales and sale items deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
