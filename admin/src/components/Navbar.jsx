import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { aToken, logout } = useContext(AdminContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };
  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2 text-xs">
        <img src={assets.admin_logo} alt="" className="w-36 cursor-pointer" />
        <p className="border px-2.5 rounded-full border-gray-500 text-gray-600">
          {aToken ? "Admin" : "Doctor"}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="bg-primary text-white text-sm px-10 py-2 rounded-full "
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
