import { useEffect, useState } from "react";
import { fetchProducts } from "../api"; // fetchProducts uses BASE_URL internally

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    getProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 p-4">
      <h2 className="text-2xl font-bold mb-6 text-white-500">📋 Inventory</h2>

      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search liquor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 w-full max-w-sm rounded bg-gray-900/70 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800 shadow-md bg-gray-900/80">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-amber-400">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Price (Ksh)</th>
              <th className="py-2 px-4 text-left">In Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p, idx) => (
                <tr
                  key={p.id}
                  className={`border-t border-gray-700 ${
                    idx % 2 === 0 ? "bg-gray-900/80" : "bg-gray-800/60"
                  } hover:bg-gray-800/70 transition`}
                >
                  <td className="py-2 px-4">{p.name}</td>
                  <td className="py-2 px-4 text-amber-400 font-medium">{p.price}</td>
                  <td className="py-2 px-4">{p.stock}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-3 text-center text-gray-400 italic">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
