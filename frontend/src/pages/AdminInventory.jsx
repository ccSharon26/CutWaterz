import { useEffect, useState } from "react";
import { fetchProducts, addProduct, deleteProduct, stockIn } from "../api";

export default function AdminInventory({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [addQty, setAddQty] = useState({});
  const [loading, setLoading] = useState(false);

  const getProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) return alert("⚠️ Please fill in all product details!");

    try {
      setLoading(true);
      await addProduct({ name, price: parseFloat(price), stock: parseInt(stock || 0), category });
      alert("✅ Product added successfully!");
      setName(""); setPrice(""); setStock(""); setCategory("");
      getProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (id) => {
    const qty = parseInt(addQty[id]);
    if (!qty || qty < 1) return alert("Enter valid quantity.");
    try {
      await stockIn(id, qty);
      setAddQty({ ...addQty, [id]: "" });
      alert("Stock updated!");
      getProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to update stock.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("❌ Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      alert("🗑️ Product deleted successfully.");
      getProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="bg-[#0f0f0f] text-gray-100 min-h-screen pt-20 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-amber-500">🧃 Admin Inventory</h2>
        <button
          onClick={onLogout}
          className="bg-red-600 px-3 py-1 rounded font-semibold hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleAddProduct} className="border border-gray-800 p-4 rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-3 text-amber-400">➕ Add New Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 rounded bg-[#0f0f0f] border border-gray-700 text-gray-100"/>
          <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="p-2 rounded bg-[#0f0f0f] border border-gray-700 text-gray-100"/>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 rounded bg-[#0f0f0f] border border-gray-700 text-gray-100">
            <option value="">Select Size</option>
            <option value="Quarter">Quarter</option>
            <option value="Half">Half</option>
            <option value="750ml">750ml</option>
            <option value="1L">1L</option>
            <option value="Other">Other</option>
          </select>
          <input type="number" placeholder="Initial Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="p-2 rounded bg-[#0f0f0f] border border-gray-700 text-gray-100"/>
          <button type="submit" disabled={loading} className="bg-amber-500 text-black rounded font-semibold hover:bg-amber-600 transition">
            {loading ? "Saving..." : "Add Product"}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-amber-400">📦 Current Stock</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-800">
            <thead>
              <tr className="bg-amber-500 text-black">
                <th className="p-2 text-left">Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Add Stock</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? products.map((p) => (
                <tr key={p.id} className="border-t border-gray-700">
                  <td className="p-2">{p.name}</td>
                  <td className="text-center">{p.category || "—"}</td>
                  <td className="text-center">Ksh {p.price}</td>
                  <td className="text-center">{p.stock}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <input type="number" min="1" placeholder="Qty" value={addQty[p.id] || ""} onChange={(e) => setAddQty({ ...addQty, [p.id]: e.target.value })} className="w-20 text-center p-1 bg-[#0f0f0f] border border-gray-700 text-gray-100 rounded"/>
                      <button onClick={() => handleAddStock(p.id)} className="bg-amber-500 text-black px-3 py-1 rounded font-semibold hover:bg-amber-600 transition">Add</button>
                    </div>
                  </td>
                  <td className="text-center">
                    <button onClick={() => handleDelete(p.id)} className="bg-red-600 text-white px-3 py-1 rounded font-semibold hover:bg-red-700 transition">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="p-3 text-center text-gray-500 italic">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
