import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : "",
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsCursor, setAppointmentsCursor] = useState(null);
  const [hasMoreAppointments, setHasMoreAppointments] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        backendURL + "/api/admin/all-doctors",
        {},
        { headers: { Authorization: `Bearer ${aToken}` } },
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
        { headers: { Authorization: `Bearer ${aToken}` } },
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

  const updateDoctor = async (formData) => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        backendURL + "/api/admin/update-doctor",
        formData,
        { headers: { Authorization: `Bearer ${aToken}` } },
      );
      if (data.success) {
        toast.success(data.message);
        await getAllDoctors();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllAppointments = async (limit = 10) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${backendURL}/api/admin/all-appointments?limit=${limit}`,
        { headers: { Authorization: `Bearer ${aToken}` } },
      );
      if (data.success) {
        setAppointments(data.appointments);
        if (data.pagination) {
          setAppointmentsCursor(data.pagination.nextCursor);
          setHasMoreAppointments(data.pagination.hasNextPage);
        }
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

  const loadMoreAppointments = async (limit = 10) => {
    if (!hasMoreAppointments || !appointmentsCursor) return;
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${backendURL}/api/admin/all-appointments?limit=${limit}&cursor=${appointmentsCursor}`,
        { headers: { Authorization: `Bearer ${aToken}` } },
      );
      if (data.success) {
        setAppointments((prev) => [...prev, ...data.appointments]);
        if (data.pagination) {
          setAppointmentsCursor(data.pagination.nextCursor);
          setHasMoreAppointments(data.pagination.hasNextPage);
        }
      }
    } catch (error) {
      console.log("Error:", error);
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
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        backendURL + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { Authorization: `Bearer ${aToken}` } },
      );
      if (data.success) {
        toast.success(data.message);
        // Reload all appointments to reflect changes
        await getAllAppointments();
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
        headers: { Authorization: `Bearer ${aToken}` },
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
    updateDoctor,
    appointments,
    setAppointments,
    getAllAppointments,
    loadMoreAppointments,
    hasMoreAppointments,
    cancelAppointment,
    dashboardData,
    getDashboardData,
    isLoading,
    setIsLoading,
  };
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
