// 🧱 AdminGate overlay component
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AdminGate = ({ children }) => {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  const correctPassword = "12345"; // 🔒 change when ready

  // Restore session
  useEffect(() => {
    const auth = sessionStorage.getItem("isAdminAuthorized");
    if (auth === "true") setIsAuthorized(true);
  }, []);

  // Expire session after 3 minutes of inactivity
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

  // 🔒 If user navigates away from /admin, revoke session
 useEffect(() => {
  const currentHash = window.location.hash;
  if (!currentHash.endsWith("/admin")) {
    sessionStorage.removeItem("isAdminAuthorized");
    setIsAuthorized(false);
  }
}, [location]);

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
    window.location.href = `${window.location.origin}${window.location.pathname}#/pos`;
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

export default AdminGate;
