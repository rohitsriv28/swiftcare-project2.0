import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Upload,
  Calendar,
  Loader2,
  X,
} from "lucide-react";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, getUserData } =
    useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize address if it doesn't exist
  useEffect(() => {
    if (userData && !userData.address) {
      setUserData((prev) => ({ ...prev, address: { line1: "", line2: "" } }));
    }
  }, [userData, setUserData]);

  const updateUserData = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone || "");
      formData.append(
        "address",
        JSON.stringify(userData.address || { line1: "", line2: "" })
      );
      formData.append("gender", userData.gender || "Not Selected");
      formData.append("dob", userData.dob || "Not Selected");

      if (image) formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await getUserData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Show login message if not logged in
  if (!userData) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 text-center bg-white rounded-2xl shadow-lg animate-fadeIn">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-red-50 rounded-full">
          <User size={30} className="text-red-500" />
        </div>
        <p className="text-xl font-semibold text-red-500">
          You are not logged in!
        </p>
        <p className="text-gray-600 mt-3">
          Please log in to view your profile.
        </p>
        <button className="mt-6 px-8 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition duration-300">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header with gradient background */}
      <div className="w-full bg-gradient-to-r from-[#7F7FD5] to-[#91EAE4] h-56 relative">
        <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Profile Image */}
            <div className="relative">
              {isEdit ? (
                <label htmlFor="image" className="cursor-pointer group">
                  <div className="relative inline-block">
                    <img
                      src={image ? URL.createObjectURL(image) : userData.image}
                      alt="Profile"
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-white shadow-lg group-hover:opacity-90 transition"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-white p-2 rounded-full shadow-md">
                        <Upload size={22} className="text-primary" />
                      </div>
                    </div>
                  </div>
                  <input
                    onChange={(e) => setImage(e.target.files[0])}
                    type="file"
                    id="image"
                    accept="image/*"
                    hidden
                  />
                </label>
              ) : (
                <img
                  src={userData.image}
                  alt="Profile"
                  className="w-32 h-32 md:w-40 md:h-40 object-fit rounded-full border-4 border-blue-400 shadow-lg"
                />
              )}
            </div>

            {/* Name and Edit Button */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between flex-1 pb-3">
              {isEdit ? (
                <input
                  type="text"
                  value={userData.name || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-white text-xl md:text-3xl font-medium px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4 md:mb-0 w-full md:w-auto"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="font-semibold text-2xl md:text-3xl text-white md:text-neutral-800 mb-4 md:mb-0">
                  {userData.name}
                </h1>
              )}

              {/* Edit/Save Buttons */}
              <div className="flex items-center gap-3">
                {isEdit ? (
                  <>
                    <button
                      onClick={() => setIsEdit(false)}
                      className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                      disabled={loading}
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={updateUserData}
                      className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center min-w-[100px] gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>Save</>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEdit(true)}
                    className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-primary hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area - Only showing profile information */}
      <div className="container mx-auto px-4 pt-32 pb-12">
        {/* Tab Navigation - Simplified to only show Profile */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex">
            <div className="py-4 px-1 font-medium text-sm border-b-2 border-primary text-primary">
              Profile Information
            </div>
          </nav>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 hover:shadow-md transition duration-300">
            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4 mb-6 flex items-center gap-2">
              <Mail size={18} className="text-primary" />
              Contact Information
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-[1fr_2fr] gap-4">
                <div className="font-medium text-gray-700 flex items-center gap-2">
                  <Mail size={16} className="text-gray-500" />
                  Email:
                </div>
                <div className="text-blue-600">{userData.email}</div>

                <div className="font-medium text-gray-700 flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  Phone:
                </div>
                {isEdit ? (
                  <input
                    type="tel"
                    value={userData.phone || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="bg-gray-50 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your phone number"
                  />
                ) : (
                  <div className="text-blue-600">
                    {userData.phone || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <div className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  Address:
                </div>
                {isEdit ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={userData.address?.line1 || ""}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          address: {
                            ...(prev.address || {}),
                            line1: e.target.value,
                          },
                        }))
                      }
                      className="bg-gray-50 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Address Line 1"
                    />
                    <input
                      type="text"
                      value={userData.address?.line2 || ""}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          address: {
                            ...(prev.address || {}),
                            line2: e.target.value,
                          },
                        }))
                      }
                      className="bg-gray-50 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Address Line 2"
                    />
                  </div>
                ) : (
                  <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {userData.address?.line1 ? (
                      <>
                        {userData.address.line1}
                        {userData.address.line2 && (
                          <>
                            <br />
                            {userData.address.line2}
                          </>
                        )}
                      </>
                    ) : (
                      "Not provided"
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 hover:shadow-md transition duration-300">
            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4 mb-6 flex items-center gap-2">
              <User size={18} className="text-primary" />
              Basic Information
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-[1fr_2fr] gap-4">
                <div className="font-medium text-gray-700">Gender:</div>
                {isEdit ? (
                  <select
                    value={userData.gender || "Not Selected"}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="bg-gray-50 w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Not Selected">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="text-gray-700">
                    {userData.gender || "Not provided"}
                  </div>
                )}

                <div className="font-medium text-gray-700 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  Date of Birth:
                </div>
                {isEdit ? (
                  <input
                    type="date"
                    value={userData.dob || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        dob: e.target.value,
                      }))
                    }
                    className="bg-gray-50 w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <div className="text-gray-700">
                    {userData.dob || "Not provided"}
                  </div>
                )}

                <div className="font-medium text-gray-700">Age:</div>
                <div className="text-gray-700">
                  {userData.dob ? calculateAge(userData.dob) : "Not available"}
                </div>

                <div className="font-medium text-gray-700">Member Since:</div>
                <div className="text-gray-700">April 2025</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate age from DOB
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age + " years";
};

export default MyProfile;
