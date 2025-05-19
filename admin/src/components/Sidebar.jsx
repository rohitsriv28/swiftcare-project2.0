import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { Home, Calendar, UserPlus, Users, User } from "lucide-react";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  const NavItem = ({ to, icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 py-4 px-4 md:px-6 transition-all duration-200 rounded-lg mx-2 mb-1 
        ${
          isActive
            ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
            : "text-gray-600 hover:bg-gray-100"
        }`
      }
    >
      {icon}
      <span className="hidden md:block text-sm">{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-white border-r border-gray-200 shadow-sm pt-4">
      {aToken && (
        <div className="space-y-1">
          <NavItem
            to="/admin/dashboard"
            icon={<Home size={20} />}
            label="Dashboard"
          />
          <NavItem
            to="/all-appointments"
            icon={<Calendar size={20} />}
            label="Appointments"
          />
          <NavItem
            to="/add-doctor"
            icon={<UserPlus size={20} />}
            label="Add Doctor"
          />
          <NavItem
            to="/all-doctors"
            icon={<Users size={20} />}
            label="All Doctors"
          />
        </div>
      )}

      {dToken && (
        <div className="space-y-1">
          <NavItem
            to="/doctor/dashboard"
            icon={<Home size={20} />}
            label="Dashboard"
          />
          <NavItem
            to="/doctor/appointments"
            icon={<Calendar size={20} />}
            label="Appointments"
          />
          <NavItem
            to="/doctor/profile"
            icon={<User size={20} />}
            label="Profile"
          />
        </div>
      )}

      {/* <div className="absolute bottom-8 left-0 right-0 px-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-primary text-sm mb-1">
            MediCare Pro
          </h3>
          <p className="text-xs text-gray-600 mb-3">Access premium features</p>
          <button className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 rounded-md w-full transition-colors">
            Upgrade Now
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;
