import { DataTypes } from "sequelize";
import { sequelize } from "./Database.js";

const Admin = sequelize.define("Admin", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Admin;
