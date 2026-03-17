import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChefHat,
  Home,
  UtensilsCrossed,
  Calendar,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Refrigerator,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { user, logout, isDemoUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/pantry", icon: Refrigerator, label: "Pantry" },
    { to: "/generate", icon: Sparkles, label: "Generate" },
    { to: "/recipes", icon: UtensilsCrossed, label: "Recipes" },
    { to: "/meal-plan", icon: Calendar, label: "Meal Plan" },
    { to: "/shopping-list", icon: ShoppingCart, label: "Shopping" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center transform rotate-3">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900 tracking-tight">
              SmartChef
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                icon={<link.icon className="w-4 h-4" />}
                label={link.label}
                isActive={
                  location.pathname === link.to ||
                  (link.to !== "/" && location.pathname.startsWith(link.to))
                }
              />
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/settings"
              className={`p-2 rounded-lg transition-all duration-200 ${
                location.pathname === "/settings"
                  ? "bg-stone-100 text-orange-600"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/*  User Profile Dropdown */}
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-transparent group-hover:ring-stone-200 transition-all">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-lg shadow-stone-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-stone-100">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to ||
                  (link.to !== "/" && location.pathname.startsWith(link.to))
                    ? "bg-orange-50 text-orange-700"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* Demo Banner */}
      {isDemoUser && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-sm text-amber-800">
            <span>🔒</span>
            <span>
              <span className="font-semibold">Demo account</span> — explore
              only.{" "}
              <Link
                to="/signup"
                className="underline font-semibold text-orange-700 hover:text-orange-900"
              >
                Create an account
              </Link>{" "}
              for full access.
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-stone-900 text-white shadow-sm"
          : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;
