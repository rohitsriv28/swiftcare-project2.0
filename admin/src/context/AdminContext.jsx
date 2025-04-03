import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors = async () => {
    // console.log(backendURL, aToken);
    try {
      const { data } = await axios.post(
        backendURL + "/api/admin/all-doctors",
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        console.log(data.data);
        setDoctors(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error("Error while fetching doctors:", error.message);
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendURL + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("aToken");
    setAToken("");
  };
  const value = {
    aToken,
    setAToken,
    backendURL,
    logout,
    doctors,
    getAllDoctors,
    changeAvailability
  };
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
