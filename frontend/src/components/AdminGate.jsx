import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminGate = ({ children }) => {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const correctPassword = "12345";
  const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  // Check if user is already authorized and session not expired
  useEffect(() => {
    const auth = sessionStorage.getItem("isAdminAuthorized");
    const expiry = sessionStorage.getItem("adminExpiry");

    if (auth === "true" && expiry && Date.now() < parseInt(expiry, 10)) {
      setIsAuthorized(true);
    } else {
      sessionStorage.removeItem("isAdminAuthorized");
      sessionStorage.removeItem("adminExpiry");
    }
  }, []);

  // Invalidate session on tab close or navigation away
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem("isAdminAuthorized");
      sessionStorage.removeItem("adminExpiry");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      sessionStorage.setItem("isAdminAuthorized", "true");
      sessionStorage.setItem("adminExpiry", Date.now() + SESSION_TIMEOUT);
      setIsAuthorized(true);
      setPassword("");
    } else {
      alert("Incorrect password!");
      setPassword("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthorized");
    sessionStorage.removeItem("adminExpiry");
    setIsAuthorized(false);
    navigate("/pos", { replace: true }); // ✅ Fix redirect for live build
  };

  // Revoke access if session expired while browsing
  useEffect(() => {
    const interval = setInterval(() => {
      const expiry = sessionStorage.getItem("adminExpiry");
      if (expiry && Date.now() > parseInt(expiry, 10)) {
        handleLogout();
      }
    }, 10000); // check every 10s

    return () => clearInterval(interval);
  }, []);

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

export default AdminGate;
