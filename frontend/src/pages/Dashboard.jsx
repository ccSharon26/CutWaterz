import { useEffect, useState, useCallback } from "react";
import { Calendar, Clock } from "lucide-react";
import { fetchSales } from "../api";

export default function Dashboard() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [filter, setFilter] = useState("today");
  const [selectedDate, setSelectedDate] = useState("");
  const [timeString, setTimeString] = useState(new Date().toLocaleTimeString());

  // live clock
  useEffect(() => {
    const id = setInterval(() => setTimeString(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  const getSales = useCallback(async () => {
    try {
      const data = await fetchSales();
      setSales(data || []);
    } catch (err) {
      console.error("Error fetching sales:", err);
    }
  }, []);

  useEffect(() => {
    getSales();
  }, [getSales]);

  const applyFilter = useCallback(() => {
    const now = new Date();
    let filtered = [];

    if (selectedDate) {
      filtered = sales.filter(
        (s) => new Date(s.createdAt).toDateString() === new Date(selectedDate).toDateString()
      );
    } else if (filter === "today") {
      filtered = sales.filter((s) => new Date(s.createdAt).toDateString() === now.toDateString());
    } else if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      filtered = sales.filter((s) => new Date(s.createdAt) >= weekAgo);
    } else {
      filtered = sales;
    }

    setFilteredSales(filtered);
  }, [sales, filter, selectedDate]);

  useEffect(() => {
    applyFilter();
  }, [sales, filter, selectedDate, applyFilter]);

  const totalRevenue = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Clock className="text-amber-400" />
          <h2 className="text-2xl font-bold text-amber-500">Sales Dashboard</h2>
        </div>
        <p className="text-sm text-gray-400 hidden sm:block">{timeString}</p>
      </div>

      {/* Filter row: Today | This Week | Calendar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-gray-900/60 p-3 rounded-lg border border-gray-700">
        <button
          onClick={() => {
            setFilter("today");
            setSelectedDate("");
          }}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            filter === "today"
              ? "bg-amber-500 text-black"
              : "bg-gray-800 hover:bg-gray-700 text-gray-200"
          }`}
        >
          Today
        </button>

        <button
          onClick={() => {
            setFilter("week");
            setSelectedDate("");
          }}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            filter === "week"
              ? "bg-amber-500 text-black"
              : "bg-gray-800 hover:bg-gray-700 text-gray-200"
          }`}
        >
          This Week
        </button>

        {/* Calendar inline */}
        <div className="flex items-center gap-2 bg-gray-800/80 p-2 rounded-lg border border-gray-700">
          <Calendar className="text-amber-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setFilter("");
            }}
            className="bg-transparent outline-none text-gray-100 cursor-pointer text-sm"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="ml-2 text-sm text-gray-300 hover:text-amber-400"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900/70 p-4 rounded-md shadow-md flex justify-between items-center">
          <p className="text-lg">
            Total Sales:{" "}
            <span className="text-amber-400 font-semibold">{filteredSales.length}</span>
          </p>
        </div>
        <div className="bg-gray-900/70 p-4 rounded-md shadow-md flex justify-between items-center">
          <p className="text-lg">
            Total Revenue:{" "}
            <span className="text-amber-400 font-semibold">
              Ksh {totalRevenue.toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      {/* Sales Table */}
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
                  key={sale.id || idx}
                  className={`border-t border-gray-700 ${
                    idx % 2 === 0 ? "bg-gray-900/70" : "bg-gray-800/50"
                  } hover:bg-gray-800/60`}
                >
                  <td className="py-2 px-4">{new Date(sale.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4 space-y-1">
                    {sale.SaleItems?.map((item) => (
                      <div key={item.id}>
                        {item.quantity}×{" "}
                        <span className="text-amber-400">
                          {item.Product?.name || "Unnamed Product"}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td className="py-2 px-4 text-amber-400 font-semibold">
                    {(sale.total || 0).toFixed(2)}
                  </td>
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
