import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; 


const Product = sequelize.define("Product", {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  category: {
    type: DataTypes.ENUM("Quarter", "Half", "750ml", "1L", "Other"),
    defaultValue: "750ml",
  },
});

export default Product;
