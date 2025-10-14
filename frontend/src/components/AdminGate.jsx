// paste this AdminGate component into App.jsx (replace the current AdminGate)
import { useState, useEffect } from "react";

const AdminGate = ({ children }) => {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const correctPassword = "12345"; // change when ready

  // on mount, check sessionStorage
  useEffect(() => {
    const auth = sessionStorage.getItem("isAdminAuthorized");
    if (auth === "true") setIsAuthorized(true);

    // cleanup: when this component unmounts (i.e. leaving /admin),
    // remove the session flag so returning requires login again.
    return () => {
      sessionStorage.removeItem("isAdminAuthorized");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      sessionStorage.setItem("isAdminAuthorized", "true");
      setIsAuthorized(true);
      setPassword("");
    } else {
      alert("Incorrect password!");
      setPassword("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthorized");
    // keep behavior you had: go back to home
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

export default AdminGate;
