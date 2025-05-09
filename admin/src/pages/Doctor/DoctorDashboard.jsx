import { useState, useEffect, useContext } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { User, Calendar, CheckSquare, X, BadgeIndianRupee, RefreshCw } from "lucide-react";

const DoctorDashboard = () => {
  const {
    dToken,
    dashboardData,
    getDashboardData,
    docAppointments,
    getAppointments,
  } = useContext(DoctorContext);
  const { currencySymbol, slotDate } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const doctorName =
    JSON.parse(localStorage.getItem("doctorInfo"))?.name || "Doctor";

  const fetchData = async () => {
    if (dToken) {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([getDashboardData(), getAppointments()]);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [dToken]);

  const stats = [
    {
      title: "Total Appointments",
      value: dashboardData?.appointments || 0,
      icon: <Calendar size={24} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Completed",
      value: dashboardData?.completedAppointments || 0,
      icon: <CheckSquare size={24} />,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Cancelled",
      value: dashboardData?.cancelledAppointments || 0,
      icon: <X size={24} />,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Total Earnings",
      value: `${currencySymbol}${dashboardData?.earnings || 0}`,
      icon: <BadgeIndianRupee size={24} />,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const upcomingAppointments = dashboardData?.latestAppointments || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-xl text-gray-700">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Doctor Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition"
          >
            <RefreshCw
              size={18}
              className={`${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <div className="text-lg font-medium text-gray-700">
            Welcome, Dr. {doctorName}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-4 lg:p-6 transition-all hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-xl lg:text-2xl font-bold mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 ${stat.color} rounded-full`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
          <span className="text-xs text-gray-500">
            {upcomingAppointments.length} upcoming
          </span>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                {/* Patient Image or Default Icon */}
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 overflow-hidden">
                  {appointment.userData?.image ? (
                    <img
                      src={appointment.userData.image}
                      alt="Patient"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-blue-600" />
                  )}
                </div>

                {/* Appointment Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{appointment.userData?.name}</p>
                  <p className="text-xs text-gray-500">
                    {slotDate(appointment.slotDate)} • {appointment.slotTime}
                  </p>
                </div>

                {/* Payment Status */}
                <div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.payment
                        ? "bg-green-100 text-green-800"
                        : " bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {appointment.payment ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No upcoming appointments</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Recent Appointments</h2>
          <span className="text-xs text-gray-500">
            Showing {Math.min(5, docAppointments?.length || 0)} of{" "}
            {docAppointments?.length || 0}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {docAppointments &&
                docAppointments.slice(0, 5).map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.userData?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {slotDate(appointment.slotDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.slotTime}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.payment
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {appointment.payment ? "Online" : "Cash"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {currencySymbol}
                      {appointment.amount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {appointment.isCancelled ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      ) : appointment.isComplete ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;