import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import MyAppointments from "./MyAppointments";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, getUserData } =
    useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

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
      <div className="max-w-xl mx-auto p-6 text-center bg-white rounded-2xl shadow-md text-sm">
        <p className="text-lg font-semibold text-red-500">
          You are not logged in!
        </p>
        <p className="text-gray-600 mt-2">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Header with background */}
      <div className="w-full bg-primary/90 h-48 relative">
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
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-white shadow-md group-hover:opacity-90 transition"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-white p-2 rounded-full">
                        <img
                          src={assets.upload_icon}
                          alt="Upload"
                          className="w-6 h-6"
                        />
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
                  className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-white shadow-md"
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
                  className="bg-white text-xl md:text-3xl font-medium px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4 md:mb-0"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="font-medium text-2xl md:text-3xl text-white md:text-neutral-800 mb-4 md:mb-0">
                  {userData.name}
                </h1>
              )}

              {/* Edit/Save Buttons */}
              <div className="flex items-center gap-3">
                {isEdit ? (
                  <>
                    <button
                      onClick={() => setIsEdit(false)}
                      className="px-5 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateUserData}
                      className="px-6 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center min-w-[100px]"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEdit(true)}
                    className="px-6 py-2 rounded-md border border-gray-300 bg-white text-primary hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area with tabs */}
      <div className="container mx-auto px-4 pt-28 pb-12">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "appointments"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Medical History
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Account Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4 mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-[1fr_2fr] gap-4">
                  <div className="font-medium text-gray-700">Email:</div>
                  <div className="text-blue-600">{userData.email}</div>

                  <div className="font-medium text-gray-700">Phone:</div>
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
                      className="bg-gray-50 w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Your phone number"
                    />
                  ) : (
                    <div className="text-blue-500">
                      {userData.phone || "Not provided"}
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-medium text-gray-700 mb-2">Address:</div>
                  {isEdit ? (
                    <div className="space-y-2">
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
                        className="bg-gray-50 w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
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
                        className="bg-gray-50 w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Address Line 2"
                      />
                    </div>
                  ) : (
                    <div className="text-gray-600">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4 mb-6">
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
                      className="bg-gray-50 w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Not Selected">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="text-gray-600">
                      {userData.gender || "Not provided"}
                    </div>
                  )}

                  <div className="font-medium text-gray-700">
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
                      className="bg-gray-50 w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <div className="text-gray-600">
                      {userData.dob || "Not provided"}
                    </div>
                  )}

                  <div className="font-medium text-gray-700">Age:</div>
                  <div className="text-gray-600">
                    {userData.dob
                      ? calculateAge(userData.dob)
                      : "Not available"}
                  </div>

                  <div className="font-medium text-gray-700">Member Since:</div>
                  <div className="text-gray-600">April 2025</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4 mb-6">
                Health Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-blue-600 font-medium">Appointments</div>
                  <div className="text-2xl font-bold text-blue-700 mt-1">0</div>
                  <div className="text-xs text-blue-500 mt-1">
                    No upcoming appointments
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="text-green-600 font-medium">
                    Consultations
                  </div>
                  <div className="text-2xl font-bold text-green-700 mt-1">
                    0
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    No past consultations
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="text-purple-600 font-medium">
                    Prescriptions
                  </div>
                  <div className="text-2xl font-bold text-purple-700 mt-1">
                    0
                  </div>
                  <div className="text-xs text-purple-500 mt-1">
                    No active prescriptions
                  </div>
                </div>

                {/* <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <div className="text-orange-600 font-medium">
                    Medical Reports
                  </div>
                  <div className="text-2xl font-bold text-orange-700 mt-1">
                    0
                  </div>
                  <div className="text-xs text-orange-500 mt-1">
                    No stored reports
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                My Appointments
              </h2>
              <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition flex items-center gap-2">
                Book Appointment
              </button>
            </div>
            <MyAppointments />
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4 mb-6">
              Medical History
            </h2>
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">No medical records found</p>
              <p className="text-sm mt-2 max-w-md mx-auto">
                You don't have any medical history records yet. Your medical
                records will appear here after your first consultation.
              </p>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4 mb-6">
              Account Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-3">
                  Change Password
                </h3>
                <div className="space-y-3 max-w-md">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <button className="px-6 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
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

// import React, { useContext, useState } from "react";
// import { AppContext } from "../context/AppContext";
// import { assets } from "../assets/assets";
// import axios from "axios";
// import { toast } from "react-toastify";

// const MyProfile = () => {
//   const { userData, setUserData, token, backendUrl, getUserData } =
//     useContext(AppContext);
//   const [isEdit, setIsEdit] = useState(false);
//   const [image, setImage] = useState(false);

//   const updateUserData = async () => {
//     try {
//       const formData = new FormData();
//       formData.append("name", userData.name);
//       formData.append("phone", userData.phone);
//       formData.append("address", JSON.stringify(userData.address));
//       formData.append("gender", userData.gender);
//       formData.append("dob", userData.dob);
//       if (image) formData.append("image", image);

//       const { data } = await axios.post(
//         `${backendUrl}/api/user/update-profile`,
//         formData,
//         { headers: { token } }
//       );

//       if (data.success) {
//         toast.success(data.message);
//         await getUserData();
//         setIsEdit(false);
//         setImage(false);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   // Show login message if not logged in
//   if (!userData) {
//     return (
//       <div className="max-w-xl mx-auto p-6 text-center bg-white rounded-2xl shadow-md text-sm">
//         <p className="text-lg font-semibold text-red-500">
//           You are not logged in!
//         </p>
//         <p className="text-gray-600 mt-2">
//           Please log in to view your profile.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md text-sm space-y-4">
//       <div className="flex flex-col items-center">
//         {isEdit ? (
//           <label htmlFor="image" className="relative group cursor-pointer">
//             <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
//               {image || userData.image ? (
//                 <img
//                   src={image ? URL.createObjectURL(image) : userData.image}
//                   alt="Profile"
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <span className="text-gray-500 text-sm">Upload an Image</span>
//               )}
//             </div>
//             <img
//               src={image ? "" : assets.upload_icon}
//               alt="Upload Icon"
//               className="w-8 absolute bottom-4 right-4 group-hover:scale-110 transition"
//             />
//             <input
//               type="file"
//               id="image"
//               hidden
//               onChange={(e) => setImage(e.target.files[0])}
//             />
//           </label>
//         ) : (
//           <div className="w-36 h-36 rounded-full overflow-hidden shadow bg-gray-100 flex items-center justify-center">
//             {userData.image ? (
//               <img
//                 src={userData.image}
//                 alt="Profile"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <span className="text-gray-500 text-sm">No Image</span>
//             )}
//           </div>
//         )}

//         {isEdit ? (
//           <input
//             type="text"
//             value={userData.name}
//             onChange={(e) =>
//               setUserData((prev) => ({ ...prev, name: e.target.value }))
//             }
//             className="text-2xl font-semibold text-center mt-3 bg-gray-100 px-4 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary transition"
//           />
//         ) : (
//           <p className="text-2xl font-semibold mt-3 text-neutral-800">
//             {userData.name}
//           </p>
//         )}
//       </div>

//       <hr />

//       {/* CONTACT INFO */}
//       <div>
//         <p className="text-neutral-500 font-semibold mb-2">
//           Contact Information
//         </p>
//         <div className="space-y-3 text-neutral-700">
//           <div className="grid grid-cols-[100px_1fr] items-center gap-2">
//             <span className="font-medium">Email:</span>
//             <span className="text-blue-500">{userData.email}</span>
//           </div>
//           <div className="grid grid-cols-[100px_1fr] items-center gap-2">
//             <span className="font-medium">Phone:</span>
//             {isEdit ? (
//               <input
//                 type="tel"
//                 value={userData.phone}
//                 onChange={(e) =>
//                   setUserData((prev) => ({ ...prev, phone: e.target.value }))
//                 }
//                 className="bg-gray-100 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary transition"
//               />
//             ) : (
//               <span className="text-blue-400">{userData.phone}</span>
//             )}
//           </div>
//           <div className="grid grid-cols-[100px_1fr] items-start gap-2">
//             <span className="font-medium">Address:</span>
//             {isEdit ? (
//               <div className="space-y-1">
//                 <input
//                   type="text"
//                   value={userData.address?.line1 || ""}
//                   onChange={(e) =>
//                     setUserData((prev) => ({
//                       ...prev,
//                       address: { ...prev.address, line1: e.target.value },
//                     }))
//                   }
//                   className="bg-gray-100 px-2 py-1 rounded w-full"
//                 />
//                 <input
//                   type="text"
//                   value={userData.address?.line2 || ""}
//                   onChange={(e) =>
//                     setUserData((prev) => ({
//                       ...prev,
//                       address: { ...prev.address, line2: e.target.value },
//                     }))
//                   }
//                   className="bg-gray-100 px-2 py-1 rounded w-full"
//                 />
//               </div>
//             ) : (
//               <p className="text-gray-500 whitespace-pre-line">
//                 {userData.address?.line1 || ""}
//                 {userData.address?.line2 ? `\n${userData.address.line2}` : ""}
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* BASIC INFO */}
//       <div>
//         <p className="text-neutral-500 font-semibold mb-2">Basic Information</p>
//         <div className="space-y-3 text-neutral-700">
//           <div className="grid grid-cols-[100px_1fr] items-center gap-2">
//             <span className="font-medium">Gender:</span>
//             {isEdit ? (
//               <select
//                 value={userData.gender}
//                 onChange={(e) =>
//                   setUserData((prev) => ({ ...prev, gender: e.target.value }))
//                 }
//                 className="bg-gray-100 px-2 py-1 rounded"
//               >
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//               </select>
//             ) : (
//               <span className="text-gray-500">{userData.gender}</span>
//             )}
//           </div>
//           <div className="grid grid-cols-[100px_1fr] items-center gap-2">
//             <span className="font-medium">DOB:</span>
//             {isEdit ? (
//               <input
//                 type="date"
//                 value={userData.dob}
//                 onChange={(e) =>
//                   setUserData((prev) => ({ ...prev, dob: e.target.value }))
//                 }
//                 className="bg-gray-100 px-2 py-1 rounded"
//               />
//             ) : (
//               <span className="text-gray-500">{userData.dob}</span>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="text-center mt-6">
//         {isEdit ? (
//           <button
//             onClick={updateUserData}
//             className="bg-primary text-white px-6 py-2 rounded-full shadow hover:bg-primary/90 transition"
//           >
//             Save Changes
//           </button>
//         ) : (
//           <button
//             onClick={() => setIsEdit(true)}
//             className="border border-primary text-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition"
//           >
//             Edit Profile
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyProfile;
