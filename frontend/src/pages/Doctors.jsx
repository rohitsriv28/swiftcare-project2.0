import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  Filter,
  ChevronRight,
  Circle,
  UserCheck,
  X,
  Search,
  ChevronDown,
  MapPin,
  Star,
  Calendar,
  CheckCircle2,
} from "lucide-react";

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  const specialties = [
    "General Physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Cardiologist",
    "Orthopedic",
    "Ophthalmologist",
    "ENT Specialist",
    "Psychiatrist",
    "Dentist",
  ];

  const applyFilter = () => {
    let filtered = doctors;

    if (speciality) {
      filtered = doctors.filter((doc) => doc.speciality === speciality);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.speciality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="text-gray-800">Our</span>{" "}
          <span className="text-primary">Specialists</span>
        </h2>
        <div className="w-24 h-1 bg-primary mb-6 mx-auto md:mx-0"></div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto md:mx-0">
          Browse through our network of specialist doctors to find the right
          healthcare provider for your needs.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto md:mx-0">
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all duration-200"
          />
          <Search className="absolute left-4 top-3.5 text-primary" size={20} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Section */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 lg:mb-0 border border-gray-100">
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <h3 className="font-semibold">Filter by Specialty</h3>
              </div>
              <button
                onClick={() => setShowFilter((prev) => !prev)}
                className="lg:hidden focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1"
              >
                {showFilter ? <X size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            <div
              className={`p-4 flex flex-col gap-2 ${
                showFilter ? "block" : "hidden lg:block"
              }`}
            >
              {specialties.map((spec, index) => (
                <div
                  key={index}
                  onClick={() =>
                    speciality === spec
                      ? navigate("/doctors")
                      : navigate(`/doctors/${spec}`)
                  }
                  className={`
                    flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300
                    ${
                      speciality === spec
                        ? "bg-primary text-white font-medium shadow-md"
                        : "hover:bg-gray-100"
                    }
                  `}
                >
                  <span>{spec}</span>
                  {speciality === spec ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronRight
                      size={16}
                      className="opacity-0 group-hover:opacity-100"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="w-full lg:w-3/4">
          {filterDoc.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterDoc.map((doctor, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/appointment/${doctor._id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer transform transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                >
                  <div className="relative">
                    <div className="h-48 bg-blue-50 flex items-center justify-center overflow-hidden">
                      {doctor.image ? (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCheck
                          size={64}
                          className="text-primary opacity-50"
                        />
                      )}
                    </div>
                    <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md">
                      <div className="flex items-center gap-1 px-2 py-1">
                        <Circle fill="#10b981" stroke="none" size={8} />
                        <span className="text-green-600 text-xs font-medium">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {doctor.name}
                    </h3>

                    <div className="flex items-center gap-1 mb-3">
                      <div className="bg-primary/10 rounded-full px-3 py-1">
                        <p className="text-primary text-sm font-medium">
                          {doctor.speciality}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                      <MapPin size={14} />
                      <span>
                        {doctor.address?.city || "Available for consultation"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-4">
                      <Star size={14} fill="#FFC107" stroke="#FFC107" />
                      <span>
                        {doctor.rating || "4.8"} •{" "}
                        {doctor.reviews || "120+ reviews"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500 font-medium">
                        <Calendar size={14} className="inline mr-1" />
                        Available today
                      </span>

                      <button className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-dark transition-all duration-300 flex items-center gap-1">
                        <CheckCircle2 size={16} />
                        <span>Book Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-10 text-center shadow-md border border-gray-100">
              <div className="text-primary/40 flex justify-center mb-4">
                <Search size={64} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't find any doctors matching your criteria. Try
                adjusting your search or filter to find available doctors.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  navigate("/doctors");
                }}
                className="mt-6 bg-primary/10 text-primary px-6 py-2 rounded-lg font-medium hover:bg-primary hover:text-white transition-all duration-300"
              >
                View All Doctors
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
