import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  Menu,
  X,
  ChevronDown,
  Home,
  Users,
  Info,
  Phone,
  LogIn,
  User,
  Calendar,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken, userData } = useContext(AppContext);
  const logout = () => {
    setToken(false);
    localStorage.clear();
  };

  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm py-4 mb-2">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-primary font-bold text-2xl">SwiftCare</span>
        </div>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-8 font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-primary"
                  : "text-gray-700 hover:text-primary transition-colors"
              }
            >
              {({ isActive }) => (
                <li className="flex items-center gap-1.5 py-1">
                  <Home size={16} />
                  <span>HOME</span>
                  {isActive && (
                    <div className="absolute bottom-0 w-full h-0.5 bg-primary left-0 mt-6"></div>
                  )}
                </li>
              )}
            </NavLink>

            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                isActive
                  ? "text-primary"
                  : "text-gray-700 hover:text-primary transition-colors"
              }
            >
              {({ isActive }) => (
                <li className="flex items-center gap-1.5 py-1">
                  <Users size={16} />
                  <span>DOCTORS</span>
                  {isActive && (
                    <div className="absolute bottom-0 w-full h-0.5 bg-primary left-0 mt-6"></div>
                  )}
                </li>
              )}
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "text-primary"
                  : "text-gray-700 hover:text-primary transition-colors"
              }
            >
              {({ isActive }) => (
                <li className="flex items-center gap-1.5 py-1">
                  <Info size={16} />
                  <span>ABOUT</span>
                  {isActive && (
                    <div className="absolute bottom-0 w-full h-0.5 bg-primary left-0 mt-6"></div>
                  )}
                </li>
              )}
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? "text-primary"
                  : "text-gray-700 hover:text-primary transition-colors"
              }
            >
              {({ isActive }) => (
                <li className="flex items-center gap-1.5 py-1">
                  <Phone size={16} />
                  <span>CONTACT</span>
                  {isActive && (
                    <div className="absolute bottom-0 w-full h-0.5 bg-primary left-0 mt-6"></div>
                  )}
                </li>
              )}
            </NavLink>
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          {token && userData ? (
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-2 md:cursor-pointer"
                onClick={() => window.innerWidth >= 768 ? setShowDropdown(!showDropdown) : null}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-primary">
                  {userData.image ? (
                    <img
                      className="w-full h-full object-cover"
                      src={userData.image}
                      alt="Profile"
                    />
                  ) : (
                    <User size={20} className="text-gray-500" />
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`hidden md:block text-gray-700 transition-transform duration-300 ${
                    showDropdown ? "transform rotate-180" : ""
                  }`}
                />
              </div>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 z-20">
                  <div className="min-w-52 bg-white shadow-lg rounded-lg flex flex-col gap-2 p-3 border border-gray-100">
                    <button
                      onClick={() => {
                        navigate("my-profile");
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-md text-gray-700 hover:text-primary transition-all"
                    >
                      <User size={16} /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("my-appointments");
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-md text-gray-700 hover:text-primary transition-all"
                    >
                      <Calendar size={16} /> My Appointments
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-md text-red-500 hover:text-red-700 transition-all"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-all flex items-center gap-2 hidden md:flex"
            >
              <LogIn size={18} /> Login
            </button>
          )}

          <button
            onClick={() => setShowMenu(true)}
            className="p-2 rounded-full hover:bg-gray-100 md:hidden"
            aria-label="Menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          showMenu
            ? "fixed inset-0 z-50 bg-white transform translate-x-0"
            : "fixed inset-0 z-50 bg-white transform translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-primary font-bold text-xl">SwiftCare</span>
          <button
            onClick={() => setShowMenu(false)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

        <nav className="px-4 py-6">
          <ul className="flex flex-col gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
              onClick={() => setShowMenu(false)}
            >
              <Home size={20} />
              <span className="font-medium">HOME</span>
            </NavLink>

            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
              onClick={() => setShowMenu(false)}
            >
              <Users size={20} />
              <span className="font-medium">ALL DOCTORS</span>
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
              onClick={() => setShowMenu(false)}
            >
              <Info size={20} />
              <span className="font-medium">ABOUT</span>
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
              onClick={() => setShowMenu(false)}
            >
              <Phone size={20} />
              <span className="font-medium">CONTACT</span>
            </NavLink>

            {token && userData && (
              <>
                <div className="border-t border-gray-100 my-2"></div>
                <NavLink
                  to="/my-profile"
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-lg ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                  onClick={() => setShowMenu(false)}
                >
                  <User size={20} />
                  <span className="font-medium">MY PROFILE</span>
                </NavLink>

                <NavLink
                  to="/my-appointments"
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-lg ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                  onClick={() => setShowMenu(false)}
                >
                  <Calendar size={20} />
                  <span className="font-medium">MY APPOINTMENTS</span>
                </NavLink>

                <button
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-gray-50 w-full text-left"
                >
                  <LogOut size={20} />
                  <span className="font-medium">LOGOUT</span>
                </button>
              </>
            )}
          </ul>

          {!token && (
            <div className="mt-8 px-3">
              <button
                onClick={() => {
                  navigate("/login");
                  setShowMenu(false);
                }}
                className="bg-primary text-white w-full py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <LogIn size={18} /> Login
              </button>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;