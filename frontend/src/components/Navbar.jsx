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
      className={`fixed top-0 left-0 w-full z-50 text-gray-100 shadow-md border-b border-gray-700 px-4 sm:px-6 py-3 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } bg-black/80 backdrop-blur-md`}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-lg sm:text-xl font-bold text-amber-500 tracking-wide">
          CutWaterz 🍾
        </h1>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-medium transition-colors duration-300 ${
                currentPath === link.path
                  ? "text-amber-400 border-b-2 border-amber-500 pb-1"
                  : "text-gray-300 hover:text-amber-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Section */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Background Overlay */}
        <div
          className={`absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Sliding Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-64 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950/95 backdrop-blur-md border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-6 p-2">
            <h2 className="text-lg font-bold text-amber-500">Menu</h2>
            <button
              className="p-1 rounded hover:bg-gray-800 transition"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="text-gray-300" />
            </button>
          </div>

          <nav className="flex flex-col gap-3 px-2">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block text-base py-2 px-2 rounded transition-all ${
                  currentPath === link.path
                    ? "text-amber-400 bg-gray-800/80"
                    : "text-gray-300 hover:text-amber-400 hover:bg-gray-800/60"
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
