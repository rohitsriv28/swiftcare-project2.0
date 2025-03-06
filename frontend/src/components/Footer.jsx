import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* -----Left Section----- */}
        <div>
          <img src={assets.logo} alt="" className="mb-5 w-40" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Find, select, and book your doctor’s appointment with ease. Book
            appointments with trusted doctors in just a few clicks. A smarter
            way to connect with doctors and schedule your visit. Effortless
            doctor bookings, tailored for your health needs.
          </p>
        </div>
        {/* -----Center Section----- */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="felx flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About us</li>
            <li> Contact us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        {/* -----Right Section----- */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="felx flex-col gap-2 text-gray-600">
            <li>+977 051-123456</li>
            <li>info@swiftcare.com</li>
          </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className="py-5 text-sm text-center">Copyright 2025@ SwiftCare - All Rights Reserved. </p>
      </div>
    </div>
  );
};

export default Footer;
