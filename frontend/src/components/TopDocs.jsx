import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  Award,
  UserRound,
  CircleCheck,
  ArrowRight,
  Calendar,
  MapPin,
} from "lucide-react";

const TopDocs = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  // If there are no doctors to display
  if (!doctors || doctors.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 my-16 text-gray-900 px-4">
        <h2 className="text-2xl font-medium">Loading doctors...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 my-20 px-4 md:px-10 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Award className="text-blue-600" size={24} />
        <h1 className="text-3xl font-bold text-gray-800">
          Top Doctors to Book
        </h1>
      </div>

      <p className="text-gray-600 text-center max-w-lg mb-4">
        Connect with our highly recommended specialists and book appointments
        instantly.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {doctors.slice(0, 10).map((item, index) => (
          <div
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              scrollTo(0, 0);
            }}
            key={index}
            className="bg-white shadow-sm hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-8px] border border-gray-100 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden bg-blue-50">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                  <UserRound size={64} className="text-blue-300" />
                </div>
              )}
              {index < 3 && (
                <div className="absolute top-3 right-3 bg-yellow-400 text-xs font-bold text-white px-2 py-1 rounded-full flex items-center gap-1">
                  <Award size={12} />
                  TOP RATED
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
              <div className="flex items-center gap-2 text-sm mb-2">
                <CircleCheck size={16} className="text-green-500" />
                <p className="text-green-600 font-medium">Available</p>
              </div>

              <p className="text-gray-800 text-lg font-bold mb-1">
                {item.name}
              </p>
              <p className="text-blue-600 text-sm font-medium mb-3">
                {item.speciality}
              </p>

              <div className="flex flex-col gap-2 mt-auto">
                {item.location && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={14} />
                    <span>{item.location}</span>
                  </div>
                )}

                <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                  <Calendar size={16} />
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-full mt-10 font-medium transition-colors duration-200"
      >
        Explore All Doctors
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default TopDocs;
