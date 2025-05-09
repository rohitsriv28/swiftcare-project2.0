import React, { useContext, useEffect, useState, useRef } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import ReactSwitch from "react-switch";
import {
  Mail,
  MapPin,
  DollarSign,
  Clock,
  User,
  Info,
  Edit2,
  Save,
  X,
  Building,
  Plus,
  Upload,
  FileText,
  Settings,
  Calendar,
  IndianRupee,
  Loader,
} from "lucide-react";

const DoctorProfile = () => {
  const { dToken, doctorProfile, getDoctorProfile, updateDoctorProfile } =
    useContext(DoctorContext);

  const { currencySymbol } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    about: "",
    fee: 0,
    availability: false,
    address: {
      line1: "",
      line2: "",
    },
    image: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (dToken && !doctorProfile) {
        try {
          setLoading(true);
          await getDoctorProfile();
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      } else if (doctorProfile) {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [dToken, getDoctorProfile, doctorProfile]);

  useEffect(() => {
    if (doctorProfile && !isEditing) {
      setFormData({
        about: doctorProfile.about || "",
        fee: doctorProfile.fee || 0,
        availability: doctorProfile.availability || false,
        address: doctorProfile.address || {
          line1: "",
          line2: "",
        },
        image: null,
      });
      setImagePreview(doctorProfile.image || null);
    }
  }, [doctorProfile, isEditing]);

  const handleStatusChange = async (checked) => {
    try {
      setIsUploading(true);
      const updated = await updateDoctorProfile({
        availability: checked,
      });
      if (updated) {
        await getDoctorProfile();
      }
    } catch (error) {
      console.error("Error updating availability:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match("image.*")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);

      // Create FormData object for file upload
      const profileData = new FormData();
      profileData.append("docId", doctorProfile._id);
      profileData.append("about", formData.about);
      profileData.append("fee", formData.fee);
      profileData.append("availability", formData.availability);
      profileData.append("address", JSON.stringify(formData.address));

      // Append image if present
      if (formData.image) {
        profileData.append("image", formData.image);
      }

      const updated = await updateDoctorProfile(profileData);
      if (updated) {
        setIsEditing(false);
        await getDoctorProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "fee" ? parseFloat(value) : value,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No profile data available
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-36 h-36 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <img
                  src={
                    isEditing && imagePreview
                      ? imagePreview
                      : doctorProfile.image || "/default-doctor.png"
                  }
                  alt={`Dr. ${doctorProfile.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/default-doctor.png";
                  }}
                />
              </div>
              {isEditing && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition duration-300"
                  onClick={triggerFileInput}
                >
                  <span className="text-white font-medium flex items-center">
                    <Upload className="h-4 w-4 mr-1" />
                    Change Photo
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">
                {doctorProfile.name}
              </h1>
              <p className="text-blue-100 text-lg">
                {doctorProfile.degree} - {doctorProfile.speciality}
              </p>
              <p className="text-blue-100">
                {doctorProfile.experience} of experience
              </p>
              <div className="mt-3 flex items-center gap-3 justify-center md:justify-start">
                <span className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium text-white flex items-center gap-1">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      doctorProfile.availability
                        ? "bg-green-400"
                        : "bg-gray-300"
                    }`}
                  ></span>
                  {doctorProfile.availability ? "Available" : "Unavailable"}
                </span>
                <span className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium text-white">
                  {currencySymbol} {doctorProfile.fee}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <p className="border-b-2 border-blue-500 text-blue-600 py-4 px-1 text-center font-medium text-sm md:text-base flex items-center">
                <User className="h-4 w-4 mr-1" />
                Profile Details
              </p>
            </nav>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Contact Information
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="font-medium mr-2">Email:</span>{" "}
                  {doctorProfile.email}
                </p>
                <p className="text-gray-700 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="font-medium mr-2">Appointment Fee:</span>
                  {isEditing ? (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">{currencySymbol}</span>
                      <input
                        type="number"
                        name="fee"
                        value={formData.fee}
                        onChange={handleChange}
                        className="w-24 p-1 border rounded"
                        min="0"
                      />
                    </div>
                  ) : (
                    `${currencySymbol} ${doctorProfile.fee}`
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="font-medium">Availability:</span>
                  {isUploading ? (
                    <Loader className="animate-spin h-5 w-5 text-blue-500" />
                  ) : (
                    <ReactSwitch
                      onChange={handleStatusChange}
                      checked={doctorProfile.availability}
                      height={20}
                      width={40}
                      onColor="#10b981"
                      offColor="#d1d5db"
                      disabled={isUploading}
                    />
                  )}
                  <span
                    className={`text-sm ${
                      doctorProfile.availability
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {doctorProfile.availability ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                Address
              </h2>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="address.line1"
                      value={formData.address.line1}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500 transition"
                      placeholder="Address Line 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="address.line2"
                      value={formData.address.line2}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500 transition"
                      placeholder="Address Line 2"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-gray-700 flex flex-col">
                  <div className="flex items-start">
                    <Building className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      {doctorProfile?.address?.line1 || "No address provided"}
                      {doctorProfile?.address?.line2 && (
                        <p>{doctorProfile.address.line2}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-500" />
              About
            </h2>
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Professional Summary
                </label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500 transition h-36"
                  placeholder="Tell patients about yourself, your qualifications, areas of expertise, and your approach to treatment"
                ></textarea>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {doctorProfile.about ||
                  "No professional summary provided yet. Edit your profile to add information about your practice, experience, and approach to patient care."}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            {isEditing ? (
              <div className="space-x-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setImagePreview(doctorProfile.image || null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition flex items-center"
                >
                  <X className="h-5 w-5 mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center disabled:bg-blue-400"
                >
                  {isUploading ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-1" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-1" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
              >
                <Edit2 className="h-5 w-5 mr-1" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
