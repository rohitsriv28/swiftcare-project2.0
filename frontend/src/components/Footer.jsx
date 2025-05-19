import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import {
  Facebook,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  Home,
  Info,
  FileText,
  Heart,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="flex flex-col sm:grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14">
          {/* Company Info */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-5">
              <Heart size={24} className="text-primary" />
              <span className="text-2xl font-bold text-gray-800">
                SwiftCare
              </span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">
              Find, select, and book your doctor's appointment with ease. Book
              appointments with trusted doctors in just a few clicks. A smarter
              way to connect with doctors and schedule your visit. Effortless
              doctor bookings, tailored for your health needs.
            </p>

            <div className="flex items-center gap-4 mt-4">
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm hover:bg-primary hover:text-white transition-all"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm hover:bg-primary hover:text-white transition-all"
              >
                <FontAwesomeIcon icon={faXTwitter} size="sm" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm hover:bg-primary hover:text-white transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm hover:bg-primary hover:text-white transition-all"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:pl-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-5 relative inline-block">
              COMPANY
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-primary"></span>
            </h3>

            <ul className="flex flex-col gap-3 text-gray-600">
              <li className="group">
                <a
                  href="/"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Home size={16} className="group-hover:text-primary" />
                  <span>Home</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="/about"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Info size={16} className="group-hover:text-primary" />
                  <span>About us</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="/contact"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone size={16} className="group-hover:text-primary" />
                  <span>Contact us</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="/privacy"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <FileText size={16} className="group-hover:text-primary" />
                  <span>Privacy Policy</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-5 relative inline-block">
              GET IN TOUCH
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-primary"></span>
            </h3>

            <ul className="flex flex-col gap-3 text-gray-600">
              <li>
                <a
                  href="tel:+977051123456"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone size={16} className="text-primary" />
                  <span>+977 051-123456</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@swiftcare.com"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail size={16} className="text-primary" />
                  <span>info@swiftcare.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              Copyright 2025 © SwiftCare - All Rights Reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
