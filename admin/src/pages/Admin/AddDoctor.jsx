import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddDoctor = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [docImg, setDocImg] = useState(false);
  const [speciality, setSpeciality] = useState("General Physician");
  const [experience, setExperience] = useState("1 Year");
  const [degree, setDegree] = useState("");
  const [about, setAbout] = useState("");
  const [fees, setFees] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { aToken, backendURL } = useContext(AdminContext);
  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      if (!docImg) {
        return toast.error("Image not selected!");
      }
      const formData = new FormData();
      formData.append("image", docImg); // Doctor's image
      formData.append("name", name); // Doctor's Name
      formData.append("email", email); // Doctor's Email
      formData.append("password", password); // Doctor's Password
      formData.append("experience", experience); // Experience
      formData.append("fee", Number(fees)); // Doctor's Fee
      formData.append("speciality", speciality); // Doctor's Speciality
      formData.append("degree", degree);
      formData.append("about", about);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 }) // Address (Line 1 & Line 2)
      );

      formData.forEach((value, key) => console.log(`${key}:${value}`));
      const { data } = await axios.post(
        backendURL + "/api/admin/add-doctor",
        formData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setDocImg(false);
        setName("");
        setEmail("");
        setPassword("");
        setExperience("1 Year");
        setFees("");
        setSpeciality("General Physician");
        setDegree("");
        setAbout("");
        setAddress1("");
        setAddress2("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong", error.message);
    }
  };

  return (
    <form className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>
      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt=""
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
            />
          </label>
          <input
            type="file"
            id="doc-img"
            onChange={(e) => setDocImg(e.target.files[0])}
            hidden
          />
          <p>
            Upload Doctor <br /> Photo
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor's Name</p>
              <input
                type="text"
                placeholder="Enter the name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor's Email</p>
              <input
                type="email"
                placeholder="Enter the email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor's Password</p>
              <input
                type="password"
                placeholder="Create a strong password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Experience</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="border rounded px-3 py-2"
              >
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Years</option>
                <option value="3 Year">3 Years</option>
                <option value="4 Year">4 Years</option>
                <option value="5 Year">5 Years</option>
                <option value="6 Year">6 Years</option>
                <option value="7 Year">7 Years</option>
                <option value="8 Year">8 Years</option>
                <option value="9 Year">9 Years</option>
                <option value="10 Year">10+ Years</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor's Fee</p>
              <input
                type="number"
                placeholder="Doctor's fee"
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                required
                className="border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              {" "}
              <p>Speciality</p>
              <select
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                className="border rounded px-3 py-2"
              >
                <option value="General Physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dertmatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {" "}
              <p>Highest Eduaction</p>
              <input
                type="text"
                placeholder="Enter qualification details"
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                required
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {" "}
              <p>Address</p>
              <input
                type="text"
                placeholder="Line 1"
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Line 2"
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                className="border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>
        <div>
          <p className="mt-4 mb-2">About</p>
          <textarea
            placeholder="Basic info about the doctor"
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            rows={5}
            required
            className="w-full px-4 pt-2 border rounded"
          ></textarea>
        </div>
        <button
          type="submit"
          onClick={submitHandler}
          className="bg-primary px-10 py-3 mt-4 text-white rounded-full"
        >
          Add Doctor
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
