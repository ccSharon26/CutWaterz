import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: console.log,
});

async function reset() {
  try {
    console.log("⚠️ Dropping tables...");
    await sequelize.query('DROP TABLE IF EXISTS "SaleItems" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Sales" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Products" CASCADE;');

    console.log("✅ Tables dropped successfully.");
    await sequelize.close();
  } catch (err) {
    console.error("❌ Error dropping tables:", err);
  }
}

reset();
