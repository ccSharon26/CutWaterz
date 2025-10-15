import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";
import AdminInventory from "./pages/AdminInventory";
import StaffInventory from "./pages/StaffInventory";
import AdminGate from "./components/AdminGate";
import { syncActions } from "./utils/offlineSync";

function App() {
  useEffect(() => {
    syncActions();

    const onOnline = () => {
      console.log("🌐 Back online — syncing offline actions...");
      syncActions();
    };
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return (
    <div
      className="min-h-screen text-gray-100 overflow-x-hidden flex flex-col"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/background.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar />

      <main className="flex-1 pt-16 px-4 sm:px-6 pb-10 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/staff" element={<StaffInventory />} />
          <Route
            path="/admin"
            element={
              <AdminGate>
                {(props) => <AdminInventory {...props} />}
              </AdminGate>
            }
          />
        </Routes>
      </main>

      {/* Simple mobile footer */}
      <footer className="text-center py-4 text-gray-400 text-sm bg-gray-900/60 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} CutWaterz POS🍹</p>
      </footer>
    </div>
  );
}

export default App;
