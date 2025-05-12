import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowRight, Calendar, Shield, Award } from "lucide-react";

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden my-20 max-w-7xl mx-auto px-4">
      {/* Background Elements */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-20 -right-10 w-60 h-60 bg-blue-300/10 rounded-full blur-xl"></div>

      <div className="relative flex flex-col md:flex-row bg-gradient-to-r from-primary to-primary/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>

        {/* Left Side - Content */}
        <div className="flex-1 py-12 md:py-16 lg:py-20 px-6 md:px-12 lg:px-16 z-10">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
                <Calendar size={14} className="text-primary" />
              </span>
              <span className="text-sm text-white font-medium">
                Easy Appointment Booking
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Book Appointment
              <span className="relative">
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-white/30 rounded-full"></span>
              </span>
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mt-4">
              With 100+ Trusted Doctors
            </h3>

            <p className="text-white/80 mt-6 text-lg max-w-md">
              Get access to the best healthcare professionals with our simple
              and secure booking system.
            </p>

            <div className="flex flex-wrap gap-6 mt-8">
              <button
                onClick={() => {
                  navigate("/login");
                  scrollTo(0, 0);
                }}
                className="group flex items-center gap-2 bg-white text-primary font-medium px-8 py-3 rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105"
              >
                <UserPlus size={18} />
                <span>Create Account</span>
                <ArrowRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                />
              </button>

              <button
                onClick={() => {
                  navigate("/doctors");
                  scrollTo(0, 0);
                }}
                className="flex items-center gap-2 bg-transparent text-white border border-white/30 backdrop-blur-sm px-8 py-3 rounded-full hover:bg-white/10 transition-all duration-300"
              >
                <span>Browse Doctors</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-8 mt-10">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-white/90" />
                <span className="text-white/90 text-sm">Verified Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-white/90" />
                <span className="text-white/90 text-sm">Best in Class</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block md:w-2/5 lg:w-1/2 relative">
          {/* Image highlight effect */}
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-primary/20 z-10"></div>

          <img
            src={assets.appointment_img}
            alt="Doctor consultation"
            className="w-full h-full object-cover object-center"
          />

          {/* Floating stat card */}
          <div className="absolute top-10 -left-6 bg-white rounded-lg p-4 shadow-lg z-20 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Total Appointments</p>
                <p className="text-gray-800 font-bold text-lg">10,000+</p>
              </div>
            </div>
          </div>

          {/* Bottom card */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-3 shadow-lg z-20 w-1/3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <div>
                  <p className="text-gray-800 font-medium text-sm">
                    Online Doctors
                  </p>
                  <p className="text-gray-500 text-xs">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
