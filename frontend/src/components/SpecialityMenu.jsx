import React from "react";
import { Link } from "react-router-dom";
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
  faTooth
} from "@fortawesome/free-solid-svg-icons";

const SpecialityMenu = () => {
  const specialityData = [
    { speciality: "General Physician", icon: faUserDoctor },
    { speciality: "Gynecologist", icon: faPersonPregnant },
    { speciality: "Dermatologist", icon: faAllergies },
    { speciality: "Pediatrician", icon: faBaby },
    { speciality: "Neurologist", icon: faBrain },
    { speciality: "Cardiologist", icon: faHeartPulse },
    { speciality: "Orthopedic", icon: faBone },
    { speciality: "Ophthalmologist", icon: faEye },
    { speciality: "ENT Specialist", icon: faEarListen },
    { speciality: "Psychiatrist", icon: faBrain },
    { speciality: "Dentist", icon: faTooth },
  ];

  return (
    <div
      className="flex flex-col items-center gap-6 py-12 px-4"
      id="speciality"
    >
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Find by Speciality</h1>
        <p className="text-gray-600">
          Browse through our extensive list of trusted specialists and schedule your appointment hassle-free.
        </p>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 w-full max-w-5xl mx-auto">
        {specialityData.map((item, index) => (
          <Link
            onClick={() => window.scrollTo(0, 0)}
            key={index}
            to={`/doctors/${item.speciality}`}
            className="flex flex-col items-center p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-100 hover:translate-y-[-3px] group"
          >
            <div className="p-2 mb-2 rounded-full bg-blue-50 text-primary group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
              <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-700 text-center leading-tight">{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;