import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CONFIG from "../config";

const BASE_URL = CONFIG.BASE_URL;
const SESSION_KEY = "isAdminAuthorized";
const EXPIRY_KEY = "adminAuthExpiry";
const LAST_PATH_KEY = "lastPath";
const SESSION_LENGTH_MS = 3 * 60 * 1000; // 3 minutes

export default function AdminGate({ children }) {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mode, setMode] = useState("login"); // "login" or "set"
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const authRef = useRef(isAuthorized);
  authRef.current = isAuthorized;

  // --- Initialize auth from sessionStorage (keeps login across refresh while expiry valid)
  useEffect(() => {
    const auth = sessionStorage.getItem(SESSION_KEY);
    const expiry = sessionStorage.getItem(EXPIRY_KEY);
    const now = Date.now();
    if (auth === "true" && expiry && now < Number(expiry)) {
      setIsAuthorized(true);
    } else {
      // cleanup any stale values
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(EXPIRY_KEY);
      setIsAuthorized(false);
    }
  }, []);

  // --- Revoke access immediately when leaving /admin area
  useEffect(() => {
    const lastPath = sessionStorage.getItem(LAST_PATH_KEY) || "";
    const current = location.pathname || "/";

    // If last path was inside admin and current is not -> revoke
    if (lastPath.startsWith("/admin") && !current.startsWith("/admin")) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(EXPIRY_KEY);
      setIsAuthorized(false);
    }

    sessionStorage.setItem(LAST_PATH_KEY, current);
  }, [location.pathname]);

  // --- Active expiry check (runs every second) to auto logout when expiry reached
  useEffect(() => {
    const interval = setInterval(() => {
      const expiry = sessionStorage.getItem(EXPIRY_KEY);
      if (!expiry) return;
      if (Date.now() > Number(expiry)) {
        // session expired
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(EXPIRY_KEY);
        if (authRef.current) {
          setIsAuthorized(false);
          // navigate away to POS or root so admin UI hides
          navigate("/");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  // --- Activity listeners to extend expiry while authorized
  useEffect(() => {
    if (!isAuthorized) return;

    const extendExpiry = () => {
      const newExpiry = Date.now() + SESSION_LENGTH_MS;
      sessionStorage.setItem(EXPIRY_KEY, String(newExpiry));
    };

    // Add events
    window.addEventListener("mousemove", extendExpiry);
    window.addEventListener("click", extendExpiry);
    window.addEventListener("keydown", extendExpiry);

    // set initial extended expiry
    extendExpiry();

    return () => {
      window.removeEventListener("mousemove", extendExpiry);
      window.removeEventListener("click", extendExpiry);
      window.removeEventListener("keydown", extendExpiry);
    };
  }, [isAuthorized]);

  // --- Submit handler for login / set-password
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return alert("Please enter a password.");
    setLoading(true);

    try {
      const endpoint =
        mode === "set"
          ? `${BASE_URL}/api/auth/set-password`
          : `${BASE_URL}/api/auth/login`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "set" ? { newPassword: password } : { password }),
      });

      // parse JSON safely
      let data = null;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Non-JSON response from auth endpoint", err);
      }

      if (res.ok) {
        // success: set session and redirect to /admin (no success alert)
        const expiry = Date.now() + SESSION_LENGTH_MS;
        sessionStorage.setItem(SESSION_KEY, "true");
        sessionStorage.setItem(EXPIRY_KEY, String(expiry));
        setIsAuthorized(true);
        setPassword("");
        // If already on admin page, no navigation necessary; otherwise go to admin.
        if (!location.pathname.startsWith("/admin")) {
          navigate("/admin");
        }
      } else {
        // failure: show the error (from backend if present) — do not show success alert on correct pw
        const msg = (data && (data.error || data.message)) || "Invalid password";
        alert(msg);
      }
    } catch (err) {
      console.error("Auth request failed:", err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  // Show modal only when user is trying to access admin area and not authorized
  if (location.pathname.startsWith("/admin") && !isAuthorized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col bg-gray-800/90 border border-gray-700 p-6 rounded-lg shadow-lg w-80"
        >
          <h2 className="text-amber-400 text-xl font-bold mb-4 text-center">
            {mode === "login" ? "Admin Login" : "Set Admin Password"}
          </h2>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="mb-4 p-2 rounded border border-gray-700 bg-gray-900/80 text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoFocus
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 text-black p-2 rounded font-semibold hover:bg-amber-600 transition"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Set Password"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "set" : "login")}
            className="mt-3 text-amber-400 underline text-sm"
          >
            {mode === "login" ? "Set / Reset Password" : "Back to Login"}
          </button>
        </form>
      </div>
    );
  }

  return children();
}
