import { createContext, useCallback, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [docAppointments, setDocAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(false);

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/doctor-appointments`,
        {
          headers: {
            Authorization: `Bearer ${dToken}`,
          },
        }
      );
      if (data.success) {
        setDocAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const res = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        {
          appointmentId,
          docId: JSON.parse(localStorage.getItem("doctorInfo"))?.id,
        }, // Added docId
        {
          headers: {
            Authorization: `Bearer ${dToken}`,
          },
        }
      );

      const data = res.data;
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/cancel-appointment",
        {
          appointmentId,
          docId: JSON.parse(localStorage.getItem("doctorInfo"))?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${dToken}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
        setDashboardData(null);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(
        error.response?.data?.message || "Failed to load dashboard data"
      );
      setDashboardData(null);
    }
  };

  const getDoctorProfile = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/profile", {
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
      });
      if (data.success) {
        setDoctorProfile(data.profileData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      toast.error(
        error.response?.data?.message || "Failed to load doctor profile"
      );
    }
  }, [dToken, backendUrl]);

  const updateDoctorProfile = async (profileData) => {
    try {
      console.log(profileData)
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${dToken}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        return true;
      }
      toast.error(data.message);
      return false;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      return false;
    }
  };

  const value = {
    backendUrl,
    dToken,
    setDToken,
    docAppointments,
    setDocAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashboardData,
    setDashboardData,
    getDashboardData,
    doctorProfile,
    setDoctorProfile,
    getDoctorProfile,
    updateDoctorProfile,
  };
  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
