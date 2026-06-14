import React, { useContext } from "react";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import { AdminContext } from "./context/AdminContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import { DoctorContext } from "./context/DoctorContext";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import DoctorAppointment from "./pages/Doctor/DoctorAppointment";
import Rankings from "./pages/Admin/Rankings";
import Analytics from "./pages/Admin/Analytics";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  // console.log("App rendering, token status:", !!aToken, "Token value:", aToken);

  return aToken || dToken ? (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <Routes>
          <Route
            path="/"
            element={
              aToken ? <Dashboard /> : dToken ? <DoctorDashboard /> : <Login />
            }
          />
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={aToken ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/all-appointments" element={aToken ? <AllAppointments /> : <Navigate to="/" />} />
          <Route path="/add-doctor" element={aToken ? <AddDoctor /> : <Navigate to="/" />} />
          <Route path="/all-doctors" element={aToken ? <DoctorsList /> : <Navigate to="/" />} />
          <Route path="/rankings" element={aToken ? <Rankings /> : <Navigate to="/" />} />
          <Route path="/analytics" element={aToken ? <Analytics /> : <Navigate to="/" />} />
          {/* Doctor Routes */}
          <Route path="/doctor/appointments" element={dToken ? <DoctorAppointment /> : <Navigate to="/" />} />
          <Route path="/doctor/dashboard" element={dToken ? <DoctorDashboard /> : <Navigate to="/" />} />
          <Route path="/doctor/profile" element={dToken ? <DoctorProfile /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
