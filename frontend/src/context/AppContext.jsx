// AppContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "रु.";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  const [doctorsCursor, setDoctorsCursor] = useState(null);
  const [hasMoreDoctors, setHasMoreDoctors] = useState(true);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false,
  );
  const [userData, setUserData] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/list?limit=10",
      );
      if (data.success) {
        setDoctors(data.doctors);
        if (data.pagination) {
          setDoctorsCursor(data.pagination.nextCursor);
          setHasMoreDoctors(data.pagination.hasNextPage);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while fetching doctors data");
    }
  };

  const loadMoreDoctors = async () => {
    if (!hasMoreDoctors || !doctorsCursor) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/list?limit=10&cursor=${doctorsCursor}`,
      );
      if (data.success) {
        setDoctors((prev) => [...prev, ...data.doctors]);
        if (data.pagination) {
          setDoctorsCursor(data.pagination.nextCursor);
          setHasMoreDoctors(data.pagination.hasNextPage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        setToken(false);
        localStorage.removeItem("token");
        setUserData(false);
      } else {
        toast.error("Something went wrong while fetching user data");
      }
    }
  };

  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    getUserData,
    paymentStatus,
    setPaymentStatus,
    loadMoreDoctors,
    hasMoreDoctors,
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      getUserData();
    } else {
      setUserData(false);
    }
  }, [token]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
