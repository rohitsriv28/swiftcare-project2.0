import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        backendURL + "/api/admin/all-doctors",
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        console.log("Retrieved doctors:", data.data.length);
        setDoctors(data.data);
        return data.data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error(`Error while fetching doctors: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const changeAvailability = async (docId) => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        backendURL + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        await getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllAppointments = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${backendURL}/api/admin/all-appointments?page=${page}&limit=${limit}`,
        { headers: { aToken } }
      );
      if (data.success) {
        setAppointments(data.appointments);
        setPagination(data.pagination);
        console.log("Retrieved appointments:", data.appointments.length);
        console.log("Pagination info:", data.pagination);
        return data.appointments;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error(`Error while fetching appointments: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("aToken");
    setAToken("");
    setDashboardData(null);
    setDoctors([]);
    setAppointments([]);
    setPagination(null);
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        backendURL + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        // If pagination is available, reload the current page
        if (pagination) {
          await getAllAppointments(pagination.page, pagination.limit);
        } else {
          await getAllAppointments();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(backendURL + "/api/admin/dashboard", {
        headers: { aToken },
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
        return data.dashboardData;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error(`Error while fetching dashboard data: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    aToken,
    setAToken,
    backendURL,
    logout,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashboardData,
    getDashboardData,
    isLoading,
    setIsLoading,
    pagination,
  };
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
