// App.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import VerifyKhalti from "./components/VerifyKhalti";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="px-4 sm:px-[10%]">
        <Navbar />
      </div>

      <main className="flex-grow px-4 sm:px-[10%]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/verify-khalti" element={<VerifyKhalti />} />
        </Routes>
      </main>

      <div className="px-4 sm:px-[10%] mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default App;
