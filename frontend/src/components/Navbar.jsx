// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const currentPath = location.pathname;

  const links = [
    { name: "POS", path: "/" },
    { name: "Inventory", path: "/inventory" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Staff", path: "/staff" },
    { name: "Admin", path: "/admin" },
  ];

  // 🧭 Navbar hide on scroll down (only on mobile)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-gray-900/95 text-gray-100 shadow-md border-b border-gray-700 backdrop-blur-sm px-4 sm:px-6 py-3 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-lg sm:text-xl font-bold text-amber-500 tracking-wide">
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
                  ? "text-amber-500 border-b-2 border-amber-500 pb-1"
                  : "text-gray-300 hover:text-amber-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
          onClick={() => setIsOpen((s) => !s)}
          aria-label="Open menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile sliding menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* overlay fade */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* sliding panel */}
        <div
          className={`absolute right-0 top-0 h-full w-64 bg-gray-900 border-l border-gray-800 p-4 transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-amber-500">Menu</h2>
            <button
              className="p-1 rounded focus:outline-none"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X />
            </button>
          </div>

          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block text-base py-2 px-2 rounded transition-colors ${
                  currentPath === link.path
                    ? "text-amber-500 bg-gray-800/40"
                    : "text-gray-300 hover:text-amber-400 hover:bg-gray-800/30"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </nav>
  );
}
