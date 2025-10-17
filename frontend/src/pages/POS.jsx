import { useEffect, useState } from "react";
import { fetchProducts, recordSale as apiRecordSale } from "../api";
import { saveOfflineAction } from "../utils/offlineSync";
import CONFIG from "../config";

const BASE_URL = CONFIG.BASE_URL;

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
      if (existing.quantity >= product.stock)
        return alert("Not enough stock!");
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return setCart(cart.filter((item) => item.id !== id));
    setCart(
      cart.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleRecordSale = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setLoading(true);

    const items = cart.map((c) => ({
      id: c.id,
      quantity: c.quantity,
      price: c.price,
    }));

    try {
      await apiRecordSale(items, total);
      alert("✅ Sale recorded successfully!");
      setCart([]);
      await getProducts();
    } catch (err) {
      console.warn("Recording sale failed (probably offline).", err);
      await saveOfflineAction({
        url: `${BASE_URL}/api/sales`,
        method: "POST",
        body: { items, total },
      });

      alert("No network — sale saved locally and will sync when online.");

      // reduce stock locally for offline
      setProducts((prev) =>
        prev.map((p) => {
          const inCart = cart.find((c) => c.id === p.id);
          if (!inCart) return p;
          return { ...p, stock: p.stock - inCart.quantity };
        })
      );

      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 p-4">
      <h2 className="text-2xl font-bold mb-6 text-white">🍹 CutWaterz POS</h2>

      {/* 🧾 Cart Section (moved to top) */}
      <div className="mb-8 bg-gray-900/95 p-4 rounded-lg shadow-md border border-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-amber-500">🧾 Cart</h3>

        {cart.length === 0 ? (
          <p className="text-gray-400">No items in cart.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-700">
              <thead className="bg-amber-500 text-black">
                <tr>
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Subtotal</th>
                  <th className="p-2 text-center">Action</th>
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
                        onChange={(e) =>
                          updateQty(item.id, parseInt(e.target.value, 10))
                        }
                        className="w-16 text-center p-1 border border-gray-600 bg-gray-900/95 text-gray-100 rounded"
                      />
                    </td>
                    <td>Ksh {item.price}</td>
                    <td>Ksh {(item.price * item.quantity).toFixed(2)}</td>
                    <td className="text-center">
                      <button
                        onClick={() =>
                          setCart(cart.filter((c) => c.id !== item.id))
                        }
                        className="text-red-500 hover:text-red-400 transition font-semibold"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
          <h3 className="text-lg font-bold text-amber-400">
            Total: Ksh {total.toFixed(2)}
          </h3>
          <button
            onClick={handleRecordSale}
            disabled={loading}
            className="bg-amber-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Record Sale"}
          </button>
        </div>
      </div>

      {/* 🔍 Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm p-3 rounded-lg border border-gray-700 bg-gray-900/80 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* 🛍️ Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => addToCart(product)}
            className="bg-gray-900/90 hover:bg-gray-800 active:bg-gray-700 border border-gray-800 p-4 rounded-xl shadow-sm transition-all duration-150 flex flex-col justify-between hover:scale-[1.02] focus:ring-2 focus:ring-amber-500/50"
          >
            <div>
              <p className="font-semibold text-gray-100">{product.name}</p>
              <p className="text-sm text-amber-400">Ksh {product.price}</p>
            </div>
            <p
              className={`text-xs mt-2 ${
                product.stock > 0 ? "text-gray-400" : "text-red-500"
              }`}
            >
              Stock: {product.stock}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
