import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-3 bg-gray-900/90 text-gray-100 shadow-md border-b border-gray-700 backdrop-blur-sm">
      <h1 className="text-xl font-bold text-amber-500 tracking-wide">
        CutWaterz 🍾
      </h1>

      <div className="flex items-center gap-6">
        {[
          { name: "POS", path: "/" },
          { name: "Inventory", path: "/inventory" },
          { name: "Dashboard", path: "/dashboard" },
          { name: "Admin", path: "/admin" },
        ].map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`font-medium transition-colors duration-300 ${
              location.pathname === link.path
                ? "text-amber-500"
                : "text-gray-300 hover:text-amber-400"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
