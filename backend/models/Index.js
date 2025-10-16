import { sequelize } from "./Database.js";
import Product from "./Product.js";
import { Sale, SaleItem } from "./Sale.js";
import Admin from "./Admin.js";

// DB connection function
export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected successfully.");

    await Product.sync();
    await Sale.sync();
    await SaleItem.sync();
    await Admin.sync();

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

// Export
export { sequelize, Product, Sale, SaleItem, Admin };
