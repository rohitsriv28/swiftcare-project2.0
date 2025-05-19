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
  Search,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken, userData, backendUrl } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const logout = () => {
    setToken(false);
    localStorage.clear();
  };

  // Handle clicks outside of dropdown and search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Implement debounced search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/search-doctors`,
        { query: searchQuery },
        { headers: token ? { token } : {} }
      );

      if (response.data.success) {
        // Filter out any results with undefined _id
        const validResults = response.data.doctors.filter(
          (doctor) => doctor && doctor._id
        );
        setSearchResults(validResults);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search doctors");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDoctorClick = (doctorId) => {
  if (!doctorId) return;

  // Reset search state
  setSearchQuery("");
  setShowSearchResults(false);
  setShowMenu(false);

  // Navigate directly (no need for timeout if using Solution #1)
  navigate(`/appointment/${doctorId}`);
};

  return (
    <div className="sticky rounded-md top-0 z-50 bg-white shadow-md px-4 md:px-6 mb-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-primary font-bold text-xl md:text-2xl">
            SwiftCare
          </span>
        </div>

        {/* Search Bar - Always visible (mobile and desktop) */}
        <div
          className="relative w-full max-w-xs md:max-w-md mx-2 md:mx-4"
          ref={searchRef}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctors..."
              className="w-full py-1.5 pl-8 pr-3 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchQuery.trim() && handleSearch()}
            />
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={handleSearch}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
              </div>
            )}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {searchResults.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleDoctorClick(doctor._id)}
                  >
                    <div className="flex items-center gap-2.5">
                      {doctor.image ? (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={14} className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{doctor.name}</p>
                        <p className="text-xs text-gray-500">
                          {doctor.speciality}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showSearchResults &&
              searchQuery.trim() &&
              searchResults.length === 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                  <p className="text-sm text-gray-500">No doctors found</p>
                </div>
              )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-5 md:gap-6 font-medium text-xs md:text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-primary relative"
                  : "text-gray-700 hover:text-primary transition-colors relative"
              }
            >
              {({ isActive }) => (
                <li className="flex items-center gap-1 py-1">
                  <Home size={14} />
                  <span>HOME</span>
                  {isActive && (
                    <div className="absolute -bottom-1.5 w-full h-0.5 bg-primary left-0"></div>
                  )}
                </li>
              )}
            </NavLink>

            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                isActive
                  ? "text-primary relative"
                  : "text-gray-700 hover:text-primary transition-colors relative"
              }
            >
              {({ isActive }) => (
                <li className="flex items-center gap-1 py-1">
                  <Users size={14} />
                  <span>DOCTORS</span>
                  {isActive && (
                    <div className="absolute -bottom-1.5 w-full h-0.5 bg-primary left-0"></div>
                  )}
                </li>
              )}
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "text-primary relative"
                  : "text-gray-700 hover:text-primary transition-colors relative"
              }
            >
              {({ isActive }) => (
                <li className="flex items-center gap-1 py-1">
                  <Info size={14} />
                  <span>ABOUT</span>
                  {isActive && (
                    <div className="absolute -bottom-1.5 w-full h-0.5 bg-primary left-0"></div>
                  )}
                </li>
              )}
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? "text-primary relative"
                  : "text-gray-700 hover:text-primary transition-colors relative"
              }
            >
              {({ isActive }) => (
                <li className="flex items-center gap-1 py-1">
                  <Phone size={14} />
                  <span>CONTACT</span>
                  {isActive && (
                    <div className="absolute -bottom-1.5 w-full h-0.5 bg-primary left-0"></div>
                  )}
                </li>
              )}
            </NavLink>
          </ul>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {token && userData ? (
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-1.5 md:cursor-pointer"
                onClick={() =>
                  window.innerWidth >= 768
                    ? setShowDropdown(!showDropdown)
                    : null
                }
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-primary">
                  {userData.image ? (
                    <img
                      className="w-full h-full object-cover"
                      src={userData.image}
                      alt="Profile"
                    />
                  ) : (
                    <User size={16} className="text-gray-500" />
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={`hidden md:block text-gray-700 transition-transform duration-300 ${
                    showDropdown ? "transform rotate-180" : ""
                  }`}
                />
              </div>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-1 z-20">
                  <div className="w-48 bg-white shadow-lg rounded-lg flex flex-col gap-1.5 p-2 border border-gray-100">
                    <button
                      onClick={() => {
                        navigate("my-profile");
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md text-gray-700 hover:text-primary transition-all text-sm"
                    >
                      <User size={14} /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("my-appointments");
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md text-gray-700 hover:text-primary transition-all text-sm"
                    >
                      <Calendar size={14} /> My Appointments
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md text-red-500 hover:text-red-700 transition-all text-sm"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-4 py-1.5 rounded-full hover:bg-primary/90 transition-all flex items-center gap-1.5 text-sm hidden md:flex"
            >
              <LogIn size={14} /> Login
            </button>
          )}

          <button
            onClick={() => setShowMenu(true)}
            className="p-1.5 rounded-full hover:bg-gray-100 md:hidden"
            aria-label="Menu"
          >
            <Menu size={20} className="text-gray-700" />
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
            className="p-1.5 rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        <nav className="px-4 py-4">
          <ul className="flex flex-col gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 p-2.5 rounded-lg ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
              onClick={() => setShowMenu(false)}
            >
              <Home size={18} />
              <span className="font-medium">HOME</span>
            </NavLink>

            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                `flex items-center gap-3 p-2.5 rounded-lg ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
              onClick={() => setShowMenu(false)}
            >
              <Users size={18} />
              <span className="font-medium">ALL DOCTORS</span>
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex items-center gap-3 p-2.5 rounded-lg ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
              onClick={() => setShowMenu(false)}
            >
              <Info size={18} />
              <span className="font-medium">ABOUT</span>
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `flex items-center gap-3 p-2.5 rounded-lg ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
              onClick={() => setShowMenu(false)}
            >
              <Phone size={18} />
              <span className="font-medium">CONTACT</span>
            </NavLink>

            {token && userData && (
              <>
                <div className="border-t border-gray-100 my-2"></div>
                <NavLink
                  to="/my-profile"
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 rounded-lg ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                  onClick={() => setShowMenu(false)}
                >
                  <User size={18} />
                  <span className="font-medium">MY PROFILE</span>
                </NavLink>

                <NavLink
                  to="/my-appointments"
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 rounded-lg ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                  onClick={() => setShowMenu(false)}
                >
                  <Calendar size={18} />
                  <span className="font-medium">MY APPOINTMENTS</span>
                </NavLink>

                <button
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-lg text-red-500 hover:bg-gray-50 w-full text-left"
                >
                  <LogOut size={18} />
                  <span className="font-medium">LOGOUT</span>
                </button>
              </>
            )}
          </ul>

          {!token && (
            <div className="mt-6 px-3">
              <button
                onClick={() => {
                  navigate("/login");
                  setShowMenu(false);
                }}
                className="bg-primary text-white w-full py-2.5 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <LogIn size={16} /> Login
              </button>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
