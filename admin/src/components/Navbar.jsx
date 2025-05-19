import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, User } from "lucide-react";

const Navbar = () => {
  const { aToken, logout } = useContext(AdminContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-4 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-primary font-bold text-2xl">SwiftCare</span>
        </div>{" "}
        <div className="flex items-center gap-1 text-xs font-medium bg-gray-100 px-3 py-1.5 rounded-full">
          {aToken ? (
            <>
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-gray-700">Admin</span>
            </>
          ) : (
            <>
              <User size={14} className="text-blue-500" />
              <span className="text-gray-700">Doctor</span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="bg-primary hover:bg-primary/90 text-white text-sm px-6 py-2 rounded-full transition-colors flex items-center gap-2 shadow-sm"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
};

export default Navbar;
