import { useEffect, useState } from "react";
import { fetchProducts } from "../api";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const getProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const addToCart = (product) => {
    if (product.stock <= 0) return alert("Out of stock!");
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return alert("Not enough stock!");
      setCart(cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return setCart(cart.filter((item) => item.id !== id));
    setCart(cart.map((item) => item.id === id ? { ...item, quantity: qty } : item));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const recordSale = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setLoading(true);
    try {
      await fetch(`${process.env.NODE_ENV === "production" ? "https://<RAILWAY_URL>" : "http://localhost:4000"}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total }),
      });
      alert("Sale recorded successfully!");
      setCart([]);
      await getProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to record sale.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-[#0f0f0f] text-gray-100 min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-amber-500">🍹 CutWaterz POS Terminal</h2>

      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-6"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => addToCart(product)}
            className="bg-[#1a1a1a] hover:bg-amber-900/30 border border-gray-800 p-4 rounded-xl shadow-md transition flex flex-col justify-between"
          >
            <div>
              <p className="font-semibold text-gray-100">{product.name}</p>
              <p className="text-sm text-amber-400">Ksh {product.price}</p>
            </div>
            <p className={`text-xs mt-2 ${product.stock > 0 ? "text-gray-400" : "text-red-500"}`}>Stock: {product.stock}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 bg-[#1a1a1a] p-4 rounded-lg shadow-md border border-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-amber-500">🧾 Cart</h3>
        {cart.length === 0 ? (
          <p className="text-gray-500">No items in cart.</p>
        ) : (
          <table className="w-full text-sm border-collapse border border-gray-700">
            <thead>
              <tr className="bg-amber-500 text-black">
                <th className="p-2 text-left">Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="border-t border-gray-700">
                  <td className="p-2">{item.name}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQty(item.id, parseInt(e.target.value))}
                      className="w-16 text-center p-1 border border-gray-600 bg-[#0f0f0f] text-gray-100 rounded"
                    />
                  </td>
                  <td>Ksh {item.price}</td>
                  <td>Ksh {(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-between items-center mt-6">
          <h3 className="text-lg font-bold text-amber-400">Total: Ksh {total.toFixed(2)}</h3>
          <button
            onClick={recordSale}
            disabled={loading}
            className="bg-amber-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Record Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
