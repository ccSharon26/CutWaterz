import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";
import AdminInventory from "./pages/AdminInventory";

// AdminGate overlay component with show/hide password and remember me
const AdminGate = ({ children }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const correctPassword = "12345"; // change as needed

  useEffect(() => {
    const auth = localStorage.getItem("isAdminAuthorized") === "true";
    const rememberMe = localStorage.getItem("adminRememberMe") === "true";
    if (auth && rememberMe) setIsAuthorized(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthorized(true);
      localStorage.setItem("isAdminAuthorized", "true");
      localStorage.setItem("adminRememberMe", remember ? "true" : "false");
      setPassword("");
    } else {
      alert("Incorrect password!");
      setPassword("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthorized");
    localStorage.removeItem("adminRememberMe");
    setIsAuthorized(false);
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg w-80"
        >
          <h2 className="text-amber-400 text-xl font-bold mb-4 text-center">
            Admin Login
          </h2>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="mb-2 p-2 rounded border border-gray-700 bg-[#0f0f0f] text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-300 text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="accent-amber-500"
              />
              Show
            </label>
            <label className="text-gray-300 text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="accent-amber-500"
              />
              Remember me
            </label>
          </div>
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

function App() {
  return (
    <div className="bg-[#0f0f0f] text-gray-100 min-h-screen overflow-x-hidden">
      <Navbar />

      <main className="pt-16 px-6 pb-10">
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Admin Route */}
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
    </div>
  );
}

export default App;
