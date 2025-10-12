import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Pick env file based on NODE_ENV
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });

console.log("Using env file:", envFile);
console.log("DATABASE_URL =", process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      { name: "CutWaterz Whiskey", price: 1200, stock: 40 },
      { name: "CutWaterz Vodka", price: 950, stock: 40 },
      { name: "CutWaterz Rum", price: 800, stock: 30 },
      { name: "CutWaterz Gin", price: 1050, stock: 28 },
      { name: "CutWaterz Brandy", price: 1300, stock: 12 },
      { name: "kc pineapple", price: 780, stock: 70 },
      { name: "CutWaterz Whiskey", price: 1200, stock: 25 },
    ],
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });