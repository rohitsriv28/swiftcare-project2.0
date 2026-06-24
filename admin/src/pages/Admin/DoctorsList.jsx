import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import Switch from "react-switch";
import {
  User,
  Clock,
  IndianRupee,
  Award,
  RefreshCw,
  ArrowUpDown,
  Edit,
  Upload,
  X,
} from "lucide-react";
import { AppContext } from "../../context/AppContext";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, updateDoctor, isLoading } =
    useContext(AdminContext);
  const { currencySymbol } = useContext(AppContext);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Edit Modal State
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editPassword, setEditPassword] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setEditPassword("");
    setEditImage(null);
  };

  const closeEditModal = () => {
    setEditingDoctor(null);
    setEditPassword("");
    setEditImage(null);
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    if (!editPassword && !editImage) {
      toast.info("No changes to update");
      closeEditModal();
      return;
    }

    if (editPassword && editPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const formData = new FormData();
    formData.append("docId", editingDoctor._id);
    if (editPassword) formData.append("password", editPassword);
    if (editImage) formData.append("image", editImage);

    setIsUpdating(true);
    const success = await updateDoctor(formData);
    setIsUpdating(false);

    if (success) {
      closeEditModal();
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
            <ArrowUpDown className="h-3 w-3 text-gray-400" />
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
          <RefreshCw
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
          <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
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
                  <Award className="h-4 w-4 mr-2" />
                  <span className="text-sm">{doctor.degree}</span>
                </div>
                <div className="flex items-center mb-1">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {doctor.experience} years experience
                  </span>
                </div>
                <div className="flex items-center mb-3">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Fee: {currencySymbol}
                    {doctor.fee}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <div className="flex items-center">
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
                <button
                  onClick={() => openEditModal(doctor)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  title="Update Credentials"
                >
                  <Edit className="h-4 w-4" />
                </button>
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
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {doctor.experience} years
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
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
                        <button
                          onClick={() => openEditModal(doctor)}
                          className="ml-auto p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Update Credentials"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Credentials Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeEditModal}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="relative z-10 inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Update Credentials: {editingDoctor.name}
                  </h3>
                  <div className="mt-6">
                    <form onSubmit={handleUpdateDoctor} className="space-y-6">
                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Leave blank to keep current password"
                          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Must be at least 8 characters if provided.
                        </p>
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Profile Picture
                        </label>
                        <div className="flex items-center mt-2 space-x-4">
                          <div className="relative flex items-center justify-center w-16 h-16 overflow-hidden bg-gray-100 rounded-full border border-gray-300">
                            {editImage ? (
                              <img
                                src={URL.createObjectURL(editImage)}
                                alt="Preview"
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <img
                                src={editingDoctor.image}
                                alt="Current"
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/64?text=Dr";
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor="edit-img"
                              className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                            >
                              <Upload className="w-4 h-4 mr-2 text-gray-500" />
                              Change Photo
                            </label>
                            <input
                              type="file"
                              id="edit-img"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setEditImage(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isUpdating || (!editPassword && !editImage)}
                          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${
                            isUpdating || (!editPassword && !editImage)
                              ? "bg-indigo-400 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }`}
                        >
                          {isUpdating ? "Updating..." : "Update Credentials"}
                        </button>
                        <button
                          type="button"
                          onClick={closeEditModal}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
