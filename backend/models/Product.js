import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String,
  inStock: Boolean,
});

export default mongoose.model("Product", productSchema);
