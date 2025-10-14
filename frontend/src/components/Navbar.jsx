import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.hash.replace("#", "") || "/";
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "POS", path: "/" },
    { name: "Inventory", path: "/inventory" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Staff", path: "/staff" },
    { name: "Admin", path: "/admin" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900/90 text-gray-100 shadow-md border-b border-gray-700 backdrop-blur-sm px-6 py-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-amber-500 tracking-wide">
          CutWaterz 🍾
        </h1>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-medium transition-colors duration-300 ${
                currentPath === link.path
                  ? "text-amber-500"
                  : "text-gray-300 hover:text-amber-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`h-0.5 w-6 bg-gray-100 mb-1 rounded transition-transform ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`h-0.5 w-6 bg-gray-100 mb-1 rounded transition-opacity ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`h-0.5 w-6 bg-gray-100 rounded transition-transform ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="flex flex-col gap-3 mt-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block font-medium transition-colors duration-300 ${
                currentPath === link.path
                  ? "text-amber-500"
                  : "text-gray-300 hover:text-amber-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
