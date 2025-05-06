import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Award,
  DollarSign,
  Stethoscope,
  GraduationCap,
  Info,
  MapPin,
  Loader,
  Upload,
  X,
  IndianRupee,
} from "lucide-react";

const AddDoctor = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    speciality: "General Physician",
    experience: "1 Year",
    degree: "",
    about: "",
    fees: "",
    address1: "",
    address2: "",
  });
  const [docImg, setDocImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const { aToken, backendURL, getAllDoctors } = useContext(AdminContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!formData.degree.trim()) newErrors.degree = "Degree is required";
    if (!formData.about.trim())
      newErrors.about = "About information is required";
    if (!formData.fees) newErrors.fees = "Fee is required";
    if (!formData.address1.trim())
      newErrors.address1 = "Address line 1 is required";
    if (!docImg) newErrors.image = "Doctor's image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      if (!selectedFile.type.match("image.*")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setDocImg(selectedFile);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const clearForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      speciality: "General Physician",
      experience: "1 Year",
      degree: "",
      about: "",
      fees: "",
      address1: "",
      address2: "",
    });
    setDocImg(null);
    setErrors({});
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    try {
      setIsUploading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("image", docImg);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("experience", formData.experience);
      formDataToSend.append("fee", Number(formData.fees));
      formDataToSend.append("speciality", formData.speciality);
      formDataToSend.append("degree", formData.degree);
      formDataToSend.append("about", formData.about);
      formDataToSend.append(
        "address",
        JSON.stringify({ line1: formData.address1, line2: formData.address2 })
      );

      const { data } = await axios.post(
        `${backendURL}/api/admin/add-doctor`,
        formDataToSend,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        clearForm();
        // Refresh doctors list
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast.error(error.response?.data?.message || "Failed to add doctor");
    } finally {
      setIsUploading(false);
    }
  };

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

  const experienceOptions = [
    "1 Year",
    "2 Years",
    "3 Years",
    "4 Years",
    "5 Years",
    "6 Years",
    "7 Years",
    "8 Years",
    "9 Years",
    "10+ Years",
  ];

  return (
    <div className="m-5 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Add New Doctor</h2>
        {isUploading && (
          <div className="flex items-center text-primary">
            <Loader className="animate-spin mr-2 h-5 w-5" />
            <span>Uploading...</span>
          </div>
        )}
      </div>

      <form className="bg-white px-6 py-8 rounded-lg shadow-sm border w-full max-w-4xl mx-auto">
        {/* Doctor Image Upload */}
        <div className="mb-8">
          <p className="text-gray-700 font-medium mb-2">Doctor's Photo</p>
          <div className="flex items-center gap-4">
            <div
              className={`relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden
                ${
                  errors.image
                    ? "border-2 border-red-400"
                    : "border border-gray-300"
                }
                ${docImg ? "" : "bg-gray-100"}`}
            >
              {docImg ? (
                <>
                  <img
                    src={URL.createObjectURL(docImg)}
                    alt="Doctor Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setDocImg(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <label
                htmlFor="doc-img"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Upload size={16} className="mr-2" />
                Select Image
              </label>
              <input
                type="file"
                id="doc-img"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {errors.image && (
                <p className="mt-1 text-red-500 text-xs">{errors.image}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Upload a professional headshot (Max: 5MB)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {/* Name */}
          <div className="form-group">
            <label className="block text-gray-700 font-medium mb-2">
              Doctor's Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                className={`border ${
                  errors.name ? "border-red-400" : "border-gray-300"
                } rounded-lg pl-10 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-red-500 text-xs">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="block text-gray-700 font-medium mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="doctor@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`border ${
                  errors.email ? "border-red-400" : "border-gray-300"
                } rounded-lg pl-10 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-red-500 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="block text-gray-700 font-medium mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                className={`border ${
                  errors.password ? "border-red-400" : "border-gray-300"
                } rounded-lg pl-10 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-red-500 text-xs">{errors.password}</p>
            )}
          </div>

          {/* Experience */}
          <div className="form-group">
            <label className="block text-gray-700 font-medium mb-2">
              Experience
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg pl-10 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-white"
              >
                {experienceOptions.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Speciality */}
          <div className="form-group">
            <label className="block text-gray-700 font-medium mb-2">
              Speciality
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Stethoscope className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg pl-10 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-white"
              >
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fee */}
          <div className="form-group">
            <label className="block text-gray-700 font-medium mb-2">
              Consultation Fee <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="fees"
                placeholder="Enter fee amount"
                value={formData.fees}
                onChange={handleChange}
                className={`border ${
                  errors.fees ? "border-red-400" : "border-gray-300"
                } rounded-lg pl-10 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>
            {errors.fees && (
              <p className="mt-1 text-red-500 text-xs">{errors.fees}</p>
            )}
          </div>

          {/* Degree */}
          <div className="form-group">
            <label className="block text-gray-700 font-medium mb-2">
              Highest Qualification <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GraduationCap className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="degree"
                placeholder="E.g., MBBS, MD, MS"
                value={formData.degree}
                onChange={handleChange}
                className={`border ${
                  errors.degree ? "border-red-400" : "border-gray-300"
                } rounded-lg pl-10 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>
            {errors.degree && (
              <p className="mt-1 text-red-500 text-xs">{errors.degree}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div className="form-group">
            <label className="block text-gray-700 font-medium mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="address1"
                placeholder="Street address"
                value={formData.address1}
                onChange={handleChange}
                className={`border ${
                  errors.address1 ? "border-red-400" : "border-gray-300"
                } rounded-lg pl-10 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>
            {errors.address1 && (
              <p className="mt-1 text-red-500 text-xs">{errors.address1}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="form-group">
            <label className="block text-gray-700 font-medium mb-2">
              Address Line 2
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="address2"
                placeholder="Apt, suite, building (optional)"
                value={formData.address2}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg pl-10 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-6">
          <label className="block text-gray-700 font-medium mb-2">
            About <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <Info className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              name="about"
              placeholder="Professional experience, specializations, and approach to patient care"
              rows={5}
              value={formData.about}
              onChange={handleChange}
              className={`border ${
                errors.about ? "border-red-400" : "border-gray-300"
              } rounded-lg pl-10 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary`}
            ></textarea>
          </div>
          {errors.about && (
            <p className="mt-1 text-red-500 text-xs">{errors.about}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="submit"
            onClick={submitHandler}
            disabled={isUploading}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-md flex items-center transition-colors disabled:bg-gray-400"
          >
            {isUploading ? (
              <>
                <Loader className="animate-spin mr-2 h-4 w-4" />
                Adding Doctor...
              </>
            ) : (
              "Add Doctor"
            )}
          </button>

          <button
            type="button"
            onClick={clearForm}
            disabled={isUploading}
            className="border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDoctor;
