import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import Switch from "react-switch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faClock,
  faIndianRupeeSign,
  faAward,
  faArrowsRotate,
  faArrowsUpDown,
} from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../../context/AppContext";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, isLoading } =
    useContext(AdminContext);
  const { currencySymbol } = useContext(AppContext);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    if (aToken) {
      loadDoctors();
    }
  }, [aToken]);

  const loadDoctors = async () => {
    try {
      await getAllDoctors();
    } catch (error) {
      toast.error("Failed to load doctors");
    }
  };

  const handleStatusChange = (doctorId) => {
    changeAvailability(doctorId);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Sort doctors based on current sort settings
  const sortedDoctors = [...doctors].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "experience") {
      comparison = a.experience - b.experience;
    } else if (sortBy === "fee") {
      comparison = a.fee - b.fee;
    } else if (sortBy === "speciality") {
      comparison = a.speciality.localeCompare(b.speciality);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const SortHeader = ({ title, field }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer transition duration-150 hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {title}
        <span className="ml-1">
          {sortBy === field ? (
            sortOrder === "asc" ? (
              "↑"
            ) : (
              "↓"
            )
          ) : (
            <FontAwesomeIcon icon={faArrowsUpDown} className="h-3 w-3 text-gray-400" />
          )}
        </span>
      </div>
    </th>
  );

  return (
    <div className="min-w-[calc(100dvw-190px)] py-6 px-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Doctors Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-md transition duration-150 ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md transition duration-150 ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              List
            </button>
          </div>
        </div>

        <button
          onClick={loadDoctors}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 transition duration-150 flex items-center"
          disabled={isLoading}
        >
          <FontAwesomeIcon
            icon={faArrowsRotate}
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : sortedDoctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FontAwesomeIcon icon={faUser} className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <h3 className="text-lg font-medium">No doctors found</h3>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-150"
            >
              <div className="relative mb-3">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-40 object-cover rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/300x200?text=Doctor";
                  }}
                />
                <span
                  className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    doctor.availability
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {doctor.availability ? "Available" : "Unavailable"}
                </span>
              </div>

              <h3 className="font-bold text-lg mb-1">{doctor.name}</h3>
              <span className="text-sm bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                {doctor.speciality}
              </span>

              <div className="mt-3">
                <div className="flex items-center mb-1">
                  <FontAwesomeIcon icon={faAward} className="h-4 w-4 mr-2" />
                  <span className="text-sm">{doctor.degree}</span>
                </div>
                <div className="flex items-center mb-1">
                  <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {doctor.experience} years experience
                  </span>
                </div>
                <div className="flex items-center mb-3">
                  <FontAwesomeIcon icon={faIndianRupeeSign} className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Fee: {currencySymbol}
                    {doctor.fee}
                  </span>
                </div>
              </div>

              <div className="flex items-center pt-3 border-t">
                <span className="text-sm mr-2">Status</span>
                <Switch
                  onChange={() => handleStatusChange(doctor._id)}
                  checked={doctor.availability}
                  height={20}
                  width={40}
                  onColor="#10b981"
                  offColor="#ef4444"
                  checkedIcon={false}
                  uncheckedIcon={false}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden ">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <SortHeader title="Doctor" field="name" />
                  <SortHeader title="Specialty" field="speciality" />
                  <SortHeader title="Experience" field="experience" />
                  <SortHeader title="Fee" field="fee" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedDoctors.map((doctor, index) => (
                  <tr
                    key={doctor._id}
                    className={`hover:bg-gray-50 transition duration-150 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                            src={doctor.image}
                            alt={doctor.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/40?text=Dr";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {doctor.degree}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600">
                        {doctor.speciality}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-2 text-gray-400" />
                        {doctor.experience} years
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faIndianRupeeSign} className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="font-medium">{doctor.fee}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <Switch
                          onChange={() => handleStatusChange(doctor._id)}
                          checked={doctor.availability}
                          height={20}
                          width={40}
                          onColor="#10b981"
                          offColor="#ef4444"
                          checkedIcon={false}
                          uncheckedIcon={false}
                        />
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                            doctor.availability
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {doctor.availability ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;