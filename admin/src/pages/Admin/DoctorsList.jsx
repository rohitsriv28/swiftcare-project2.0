import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import Switch from "react-switch";
import { Search, Filter, RefreshCcw } from "lucide-react";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, isLoading } =
    useContext(AdminContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    if (aToken) {
      loadDoctors();
    }
  }, [aToken]);

  useEffect(() => {
    // Extract unique specialties for filter dropdown
    if (doctors && doctors.length > 0) {
      const uniqueSpecialties = [
        ...new Set(doctors.map((doc) => doc.speciality)),
      ];
      setSpecialties(uniqueSpecialties);
    }
  }, [doctors]);

  const loadDoctors = async () => {
    await getAllDoctors();
  };

  const handleRefresh = () => {
    loadDoctors();
  };

  const handleStatusChange = (doctorId) => {
    changeAvailability(doctorId);
  };

  // Filter doctors based on search term and specialty
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty
      ? doctor.speciality === filterSpecialty
      : true;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-semibold">Doctors Management</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctors..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="relative">
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full appearance-none"
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              <option value="">All Specialties</option>
              {specialties.map((specialty, index) => (
                <option key={index} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white rounded-md flex items-center justify-center"
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-sm rounded-lg border mb-6">
            <div className="p-4">
              <div className="flex justify-between">
                <span className="font-medium">
                  Total Doctors: {doctors.length}
                </span>
                <span className="font-medium">
                  Active: {doctors.filter((doc) => doc.availability).length}
                </span>
              </div>
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="text-center py-12 bg-white shadow-sm rounded-lg border">
              <p className="text-gray-500">
                No doctors found matching your criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white shadow-sm rounded-lg border overflow-hidden"
                >
                  <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300?text=Doctor+Image";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg">{doctor.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {doctor.speciality}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Experience: {doctor.experience} years
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {doctor.availability ? "Available" : "Unavailable"}
                        </span>
                        <Switch
                          onChange={() => handleStatusChange(doctor._id)}
                          checked={doctor.availability}
                          height={20}
                          width={40}
                          onColor="#10b981"
                          offColor="#d1d5db"
                        />
                      </div>
                      <span className="text-primary font-medium">
                        Fee: {doctor.fee}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorsList;
