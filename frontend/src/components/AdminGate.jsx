import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AdminGate = ({ children }) => {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const correctPassword = "12345"; // change anytime

  // Check session on mount
  useEffect(() => {
    const auth = sessionStorage.getItem("isAdminAuthorized");
    if (auth === "true") setIsAuthorized(true);
  }, []);

  // Timeout after 3 minutes of inactivity
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.removeItem("isAdminAuthorized");
        setIsAuthorized(false);
        navigate("/"); // back to POS
      }, 3 * 60 * 1000);
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
  }, [isAuthorized, navigate]);

  //  Force re-auth when navigating to /admin
  useEffect(() => {
    if (location.pathname === "/admin" && !isAuthorized) {
      sessionStorage.removeItem("isAdminAuthorized");
    }
  }, [location.pathname, isAuthorized]);

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

  // Only protect /admin page
  if (location.pathname === "/admin" && !isAuthorized) {
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

  return children();
};

export default AdminGate;
