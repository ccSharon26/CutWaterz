import { useEffect, useState, useCallback } from "react";
import CONFIG from "../config";

const BASE_URL = CONFIG.BASE_URL;

export default function AdminInventory({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [addQty, setAddQty] = useState({});
  const [editPrice, setEditPrice] = useState({});
  const [loading, setLoading] = useState(false);

  const getProducts = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) return alert("⚠️ Please fill in all product details!");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: parseFloat(price), stock: parseInt(stock || 0), category }),
      });
      if (!res.ok) throw new Error("Failed to add product");
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
    const qty = parseInt(addQty[id], 10);
    if (!qty || qty < 1) return alert("Enter valid quantity.");
    try {
      const res = await fetch(`${BASE_URL}/api/admin/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      alert("Stock updated!");
      setAddQty({ ...addQty, [id]: "" });
      getProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to update stock.");
    }
  };

  const handleEditPrice = async (id) => {
    const newPrice = parseFloat(editPrice[id]);
    if (isNaN(newPrice) || newPrice <= 0) return alert("Enter a valid price!");
    try {
      const res = await fetch(`${BASE_URL}/api/admin/products/${id}/price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      });
      if (!res.ok) throw new Error("Failed to update price");
      alert("💰 Price updated!");
      setEditPrice({ ...editPrice, [id]: "" });
      getProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to update price.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("❌ Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      alert("🗑️ Product deleted successfully.");
      getProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="min-h-screen pt-20 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-amber-500">🧃 Admin Inventory</h2>
        <button
          onClick={onLogout}
          className="bg-red-600 px-3 py-1 rounded font-semibold hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Add new product form */}
      <form onSubmit={handleAddProduct} className="bg-gray-900/70 border border-gray-700 p-4 rounded-lg mb-8 shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-amber-400">➕ Add New Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 rounded bg-gray-800/60 border border-gray-700 text-gray-100"/>
          <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="p-2 rounded bg-gray-800/60 border border-gray-700 text-gray-100"/>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 rounded bg-gray-800/60 border border-gray-700 text-gray-100">
            <option value="">Select Size</option>
            <option value="Quarter">Quarter</option>
            <option value="Half">Half</option>
            <option value="750ml">750ml</option>
            <option value="1L">1L</option>
            <option value="Other">Other</option>
          </select>
          <input type="number" placeholder="Initial Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="p-2 rounded bg-gray-800/60 border border-gray-700 text-gray-100"/>
          <button type="submit" disabled={loading} className="bg-amber-500 text-black rounded font-semibold hover:bg-amber-600 transition">
            {loading ? "Saving..." : "Add Product"}
          </button>
        </div>
      </form>

      {/* Product Table */}
      <div className="bg-gray-900/70 p-4 rounded-lg shadow-md overflow-x-auto border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-amber-400">📦 Current Stock</h3>
        <table className="w-full text-sm">
          <thead className="bg-amber-500 text-black">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Add Stock</th>
              <th>Edit Price</th>
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

                {/* Add Stock */}
                <td className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <input type="number" min="1" placeholder="Qty" value={addQty[p.id] || ""} onChange={(e) => setAddQty({ ...addQty, [p.id]: e.target.value })} className="w-20 text-center p-1 bg-gray-800/60 border border-gray-700 text-gray-100 rounded"/>
                    <button onClick={() => handleAddStock(p.id)} className="bg-amber-500 text-black px-3 py-1 rounded font-semibold hover:bg-amber-600 transition">Add</button>
                  </div>
                </td>

                {/* Edit Price */}
                <td className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <input type="number" placeholder="New Price" value={editPrice[p.id] || ""} onChange={(e) => setEditPrice({ ...editPrice, [p.id]: e.target.value })} className="w-20 text-center p-1 bg-gray-800/60 border border-gray-700 text-gray-100 rounded"/>
                    <button onClick={() => handleEditPrice(p.id)} className="bg-blue-500 text-black px-3 py-1 rounded font-semibold hover:bg-blue-600 transition">Save</button>
                  </div>
                </td>

                {/* Delete */}
                <td className="text-center">
                  <button onClick={() => handleDelete(p.id)} className="bg-red-600 text-white px-3 py-1 rounded font-semibold hover:bg-red-700 transition">Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="p-3 text-center text-gray-400 italic">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
