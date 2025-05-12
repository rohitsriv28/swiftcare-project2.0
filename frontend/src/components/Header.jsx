import React from "react";
import { assets } from "../assets/assets";
import { Calendar, ChevronRight, Users, User } from "lucide-react";

const Header = () => {
  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-r from-primary to-primary/90">
      <div className="absolute inset-0 bg-[url('path/to/subtle-pattern.png')] opacity-10"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row px-6 md:px-10 lg:px-20 py-10 md:py-16">
        {/* Left Side - Content */}
        <div className="md:w-1/2 flex flex-col items-start justify-center gap-6 md:py-12 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight md:leading-tight lg:leading-tight tracking-tight">
            Book Appointment <br />
            <span className="relative">
              With Trusted
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-white/30 rounded-full"></span>
            </span>{" "}
            Doctors
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-4 text-white text-base">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white z-10">
                <Users size={20} className="text-white" />
              </div>
              {/* Replace group image with user icons */}
              <div className="flex -ml-2">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border-2 border-white flex items-center justify-center z-20">
                  <User size={16} className="text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border-2 border-white flex items-center justify-center -ml-3 z-30">
                  <User size={16} className="text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border-2 border-white flex items-center justify-center -ml-3 z-40">
                  <User size={16} className="text-white" />
                </div>
              </div>
            </div>
            <p className="text-white/90 leading-relaxed max-w-md mt-2 md:mt-0">
              Simply browse through our extensive list of trusted doctors,
              <br className="hidden sm:block" /> schedule your appointment
              hassle-free.
            </p>
          </div>

          <a
            href="#speciality"
            className="group flex items-center gap-2 bg-white px-8 py-3 rounded-full text-primary font-medium shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
          >
            <Calendar size={18} />
            <span>Book Appointment</span>
            <ChevronRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>

          <div className="flex items-center gap-4 mt-4 text-white/90">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">500+</span>
              <span className="text-xs">Doctors</span>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">24/7</span>
              <span className="text-xs">Support</span>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">98%</span>
              <span className="text-xs">Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block md:w-1/2 relative mt-10 md:mt-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-full blur-xl"></div>
          <img
            src={assets.header_img}
            alt="Doctor with patient"
            className="w-full relative z-10 rounded-lg shadow-2xl transform md:translate-y-6 lg:translate-y-8 transition-all duration-500"
          />

          {/* Floating elements with improved styling */}
          <div className="hidden md:block absolute top-20 -right-8 bg-white px-4 py-3 rounded-lg shadow-lg  animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Online Consultations</span>
            </div>
          </div>
          <div className="hidden md:block absolute bottom-36 -left-8 bg-white px-4 py-3 z-50 rounded-lg shadow-lg  animate-bounce">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">Expert Care</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave shape at bottom with improved height */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          className="w-full h-auto"
        >
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Header;
