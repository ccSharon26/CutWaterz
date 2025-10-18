import sequelize from "./config/db.js";
import { Sale } from "./models/Sale.js"; 

const addPaymentMethodColumn = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Sale table updated with paymentMethod column successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error updating Sale table:", err);
    process.exit(1);
  }
};

addPaymentMethodColumn();
