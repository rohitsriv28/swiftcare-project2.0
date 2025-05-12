import React from "react";
import { MapPin, Phone, Mail, Building, Briefcase } from "lucide-react";

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-2">
          <span className="text-gray-500">CONTACT</span>{" "}
          <span className="text-primary">US</span>
        </h2>
        <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col lg:flex-row gap-16 mb-24">
        {/* Left Column - Image/Map */}
        <div className="w-full lg:w-1/2">
          <div className="bg-blue-50 rounded-xl overflow-hidden shadow-lg h-full">
            <div className="p-6 bg-primary text-white">
              <h3 className="text-xl font-bold">Get in Touch</h3>
              <p className="mt-2">
                We're here to help with any questions you may have
              </p>
            </div>
            <div className="relative h-80 w-full bg-blue-100 flex items-center justify-center">
              <MapPin size={64} className="text-primary opacity-50" />
              {/* This would typically be a real map or contact image */}
            </div>
          </div>
        </div>

        {/* Right Column - Contact Information */}
        <div className="w-full lg:w-1/2">
          <div className="space-y-8">
            {/* Office Section */}
            <div className="bg-white p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Building size={24} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Our Office</h3>
              </div>

              <div className="ml-2 space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin
                    size={20}
                    className="text-primary mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-600">
                    54709 Willms Station <br /> Suite 350, Washington, USA
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Phone size={20} className="text-primary flex-shrink-0" />
                  <p className="text-gray-600">+977 051-123456</p>
                </div>

                <div className="flex items-center gap-4">
                  <Mail size={20} className="text-primary flex-shrink-0" />
                  <p className="text-gray-600">info@swiftcare.com</p>
                </div>
              </div>
            </div>

            {/* Careers Section */}
            <div className="bg-white p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Briefcase size={24} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Careers at SwiftCare
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Learn more about our teams and exciting job openings. Join us in
                our mission to transform healthcare.
              </p>

              <button className="bg-primary text-white px-8 py-3 rounded-lg font-medium shadow-md hover:bg-primary-dark transition-all duration-300 flex items-center gap-2">
                <Briefcase size={18} />
                Explore Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
