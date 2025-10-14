// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";
import AdminInventory from "./pages/AdminInventory";
import StaffInventory from "./pages/StaffInventory";

import { syncActions } from "./utils/offlineSync"; // offline sync helper

// 🧱 AdminGate overlay component
const AdminGate = ({ children }) => {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const correctPassword = "12345"; // 🔒 change when ready

  // Restore session
  useEffect(() => {
    const auth = sessionStorage.getItem("isAdminAuthorized");
    if (auth === "true") setIsAuthorized(true);
  }, []);

  // Watch for tab switch or reload — expire after 3 minutes of inactivity
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.removeItem("isAdminAuthorized");
        setIsAuthorized(false);
      }, 3 * 60 * 1000); // 3 mins
    };

    if (isAuthorized) {
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("click", resetTimer);
      resetTimer();
    }
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [isAuthorized]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthorized(true);
      sessionStorage.setItem("isAdminAuthorized", "true");
      setPassword("");
    } else {
      alert("Incorrect password!");
      setPassword("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthorized");
    window.location.href = "/";
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col bg-gray-800/90 border border-gray-700 p-6 rounded-lg shadow-lg w-80"
        >
          <h2 className="text-amber-400 text-xl font-bold mb-4 text-center">
            Admin Login
          </h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="mb-4 p-2 rounded border border-gray-700 bg-gray-900/80 text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="bg-amber-500 text-black p-2 rounded font-semibold hover:bg-amber-600 transition"
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  return children({ onLogout: handleLogout });
};

// 🧠 Main App
function App() {
  useEffect(() => {
    // Try sync when app loads
    syncActions();

    // Re-sync whenever we go online again
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

      {/* Simple mobile footer (for Android PWA) */}
      <footer className="text-center py-4 text-gray-400 text-sm bg-gray-900/60 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} CutWaterz POS | Offline-ready 🍹</p>
      </footer>
    </div>
  );
}

export default App;
