import { Sequelize } from "sequelize";
import Product from "./Product.js";
import { Sale, SaleItem } from "./Sale.js";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

// DB connection function
export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected successfully.");

    // Sync models
    await Product.sync();
    await Sale.sync();
    await SaleItem.sync();
    console.log("✅ All models synced successfully.");
  } catch (error) {
    console.error("❌ DB connection error:", error);
  }
}

// Associations
Sale.hasMany(SaleItem, { foreignKey: "saleId", onDelete: "CASCADE" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId" });

Product.hasMany(SaleItem, { foreignKey: "productId", onDelete: "CASCADE" });
SaleItem.belongsTo(Product, { foreignKey: "productId" });

// Export models & sequelize instance
export { sequelize, Product, Sale, SaleItem };
