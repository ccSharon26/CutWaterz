import { useEffect, useState, useCallback } from "react";
import { fetchSales } from "../api";

export default function Dashboard() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [filter, setFilter] = useState("all");

  const getSales = async () => {
    try {
      const data = await fetchSales();
      setSales(data);
      setFilteredSales(data);
    } catch (err) {
      console.error("Error fetching sales:", err);
    }
  };

  useEffect(() => {
    getSales();
  }, []);

  const applyFilter = useCallback(
    (type) => {
      const now = new Date();
      let filtered = [];

      if (type === "today") {
        filtered = sales.filter(
          (s) => new Date(s.createdAt).toDateString() === now.toDateString()
        );
      } else if (type === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        filtered = sales.filter((s) => new Date(s.createdAt) >= weekAgo);
      } else {
        filtered = sales;
      }

      setFilteredSales(filtered);
    },
    [sales]
  );

  useEffect(() => {
    applyFilter(filter);
  }, [sales, filter, applyFilter]);

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="min-h-screen pt-20">
      <h2 className="text-2xl font-bold text-amber-500 mb-4">Sales Dashboard</h2>

      <div className="flex gap-3 mb-4">
        {["today", "week", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              filter === f ? "bg-amber-500 text-black" : "bg-gray-900/70 hover:bg-gray-800/60"
            }`}
          >
            {f === "today" ? "Today" : f === "week" ? "This Week" : "All Time"}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900/70 p-4 rounded-md shadow-md flex justify-between items-center">
          <p className="text-lg">Total Sales: <span className="text-amber-400 font-semibold">{filteredSales.length}</span></p>
        </div>
        <div className="bg-gray-900/70 p-4 rounded-md shadow-md flex justify-between items-center">
          <p className="text-lg">Total Revenue: <span className="text-amber-400 font-semibold">Ksh {totalRevenue.toLocaleString()}</span></p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800 shadow-md bg-gray-900/70">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-amber-400">
            <tr>
              <th className="py-2 px-4 text-left">Date</th>
              <th className="py-2 px-4 text-left">Items</th>
              <th className="py-2 px-4 text-left">Total (Ksh)</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.map((sale, idx) => (
                <tr
                  key={sale.id}
                  className={`border-t border-gray-700 ${
                    idx % 2 === 0 ? "bg-gray-900/70" : "bg-gray-800/50"
                  } hover:bg-gray-800/60`}
                >
                  <td className="py-2 px-4">{new Date(sale.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4 space-y-1">
                    {sale.SaleItems.map((item) => (
                      <div key={item.id}>
                        {item.quantity}× <span className="text-amber-400">{item.Product?.name || "Unnamed Product"}</span>
                      </div>
                    ))}
                  </td>
                  <td className="py-2 px-4 text-amber-400 font-semibold">{sale.total.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-3 text-center text-gray-400 italic">
                  No sales found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
