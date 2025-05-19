import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  UserCheck,
  Circle,
  ChevronRight,
  MapPin,
  Star,
  Calendar,
  CheckCircle2,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserDoctor,
  faPersonPregnant,
  faAllergies,
  faBaby,
  faBrain,
  faHeartPulse,
  faBone,
  faEye,
  faEarListen,
  faTooth,
} from "@fortawesome/free-solid-svg-icons";

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  const specialties = [
    { name: "General Physician", icon: faUserDoctor },
    { name: "Gynecologist", icon: faPersonPregnant },
    { name: "Dermatologist", icon: faAllergies },
    { name: "Pediatrician", icon: faBaby },
    { name: "Neurologist", icon: faBrain },
    { name: "Cardiologist", icon: faHeartPulse },
    { name: "Orthopedic", icon: faBone },
    { name: "Ophthalmologist", icon: faEye },
    { name: "ENT Specialist", icon: faEarListen },
    { name: "Psychiatrist", icon: faBrain },
    { name: "Dentist", icon: faTooth },
  ];

  const applyFilter = () => {
    let filtered = doctors;

    if (speciality) {
      filtered = doctors.filter((doc) => doc.speciality === speciality);
    }

    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);

  // Toggle filter visibility on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowFilter(true);
      } else {
        setShowFilter(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-gray-800">Our</span>{" "}
          <span className="text-primary">Specialists</span>
        </h2>
        <div className="w-16 h-1 bg-primary mb-4 mx-auto md:mx-0"></div>
        <p className="text-gray-600 text-base max-w-2xl mx-auto md:mx-0">
          Browse through our network of specialist doctors to find the right
          healthcare provider for your needs.
        </p>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="w-full flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-primary" />
            <span className="font-medium">Filter by Specialty</span>
          </div>
          {showFilter ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Section - Collapsible on Mobile */}
        <div
          className={`w-full lg:w-1/4 ${
            showFilter ? "block" : "hidden"
          } lg:block transition-all duration-300`}
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-primary text-white p-3 flex items-center gap-2">
              <Filter size={16} />
              <h3 className="font-medium text-sm">Specialties</h3>
            </div>

            <div className="p-2 flex flex-col gap-1 max-h-[460px] overflow-y-auto">
              {specialties.map((spec, index) => (
                <div
                  key={index}
                  onClick={() => {
                    speciality === spec.name
                      ? navigate("/doctors")
                      : navigate(`/doctors/${spec.name}`);
                    if (window.innerWidth < 1024) setShowFilter(false);
                  }}
                  className={`
                    flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-all duration-200
                    ${
                      speciality === spec.name
                        ? "bg-primary text-white font-medium"
                        : "hover:bg-gray-100"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={spec.icon}
                      className={
                        speciality === spec.name ? "text-white" : "text-primary"
                      }
                    />
                    <span>{spec.name}</span>
                  </div>
                  {speciality === spec.name && <ChevronRight size={14} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className="w-full lg:w-3/4">
          {filterDoc.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterDoc.map((doctor, index) => (
                <div
                  key={index}
                  onClick={() =>
                    doctor.availability &&
                    navigate(`/appointment/${doctor._id}`)
                  }
                  className={`bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 flex
      ${
        doctor.availability
          ? "hover:shadow-md cursor-pointer transition-all duration-200 hover:bg-gray-50"
          : "opacity-75 cursor-not-allowed"
      }`}
                >
                  {/* Doctor Image */}
                  <div className="relative w-20 sm:w-28 h-full overflow-hidden flex-shrink-0 min-h-[100px]">
                    <div className="h-full bg-blue-50 flex items-center justify-center">
                      {doctor.image ? (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className={`w-full h-full object-cover ${
                            !doctor.availability ? "grayscale" : ""
                          }`}
                        />
                      ) : (
                        <UserCheck
                          size={28}
                          className="text-primary opacity-50"
                        />
                      )}
                    </div>
                    <div className="absolute top-1.5 left-1.5 bg-white rounded-full p-0.5 shadow-sm">
                      {doctor.availability ? (
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5">
                          <Circle fill="#10b981" stroke="none" size={5} />
                          <span className="text-green-600 text-xs font-medium">
                            Available
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5">
                          <Circle fill="#ef4444" stroke="none" size={5} />
                          <span className="text-red-600 text-xs font-medium">
                            Not Available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-grow p-2 sm:p-3 flex flex-col justify-between overflow-hidden min-w-0">
                    <div>
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <h3 className="text-sm sm:text-base font-bold text-gray-800 truncate max-w-full pr-2">
                          {doctor.name}
                        </h3>
                        <div className="bg-primary/10 rounded-full px-2 py-0.5 flex-shrink-0">
                          <p className="text-primary text-xs font-medium truncate w-full max-w-[90px] sm:max-w-[120px]">
                            {doctor.speciality}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex items-center gap-1 text-gray-600 text-xs w-full">
                          <MapPin size={10} className="flex-shrink-0" />
                          <span className="truncate block">
                            {doctor.address?.city ||
                              "Available for consultation"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        <Calendar size={10} className="inline mr-1" />
                        {doctor.availability
                          ? "Available today"
                          : "Not available"}
                      </span>

                      {doctor.availability ? (
                        <button className="bg-primary text-white py-1 px-2 sm:px-3 text-xs rounded-md font-medium hover:bg-primary-dark transition-all duration-300 flex items-center gap-1 flex-shrink-0">
                          <CheckCircle2
                            size={10}
                            className="hidden sm:inline"
                          />
                          <span>Book Now</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-300 text-gray-600 py-1 px-2 sm:px-3 text-xs rounded-md font-medium flex items-center gap-1 flex-shrink-0 cursor-not-allowed"
                        >
                          <span>Unavailable</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't find any doctors matching your criteria. Try
                selecting a different specialty to find available doctors.
              </p>
              <button
                onClick={() => {
                  navigate("/doctors");
                }}
                className="mt-4 bg-primary/10 text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-primary hover:text-white transition-all duration-300"
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
