import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Product from "./Product.js";

const Sale = sequelize.define("Sale", {
  total: { type: DataTypes.FLOAT, allowNull: false },
});

const SaleItem = sequelize.define("SaleItem", {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
});

// Associations
Sale.hasMany(SaleItem, { foreignKey: "saleId", onDelete: "CASCADE" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId" });

Product.hasMany(SaleItem, { foreignKey: "productId", onDelete: "CASCADE" });
SaleItem.belongsTo(Product, { foreignKey: "productId" });

export { Sale, SaleItem };
