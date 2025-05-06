import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";
import {
  User,
  Calendar,
  Clock,
  Stethoscope,
  TrendingUp,
  BadgeIndianRupee,
  Activity,
  PieChart,
  BarChart2,
  RefreshCcw,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
} from "recharts";

const Dashboard = () => {
  const { dashboardData, getDashboardData, aToken, isLoading, setIsLoading } =
    useContext(AdminContext);
  const { currencySymbol, slotDate } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [datePeriod, setDatePeriod] = useState("30");

  // COLORS for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Load dashboard data
  useEffect(() => {
    if (aToken) {
      fetchDashboardData();
    }
  }, [aToken]);

  const fetchDashboardData = async () => {
    setError(null);
    try {
      await getDashboardData();
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Dashboard data fetch error:", err);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-2xl font-semibold mb-2">Loading Dashboard</div>
          <div className="text-gray-500">
            Please wait while we fetch the data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2 text-red-500">Error</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white rounded-md flex items-center mx-auto"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">No Data Available</div>
          <div className="text-gray-500 mb-4">
            Unable to load dashboard data.
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white rounded-md flex items-center mx-auto"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 bg-primary text-white rounded-md flex items-center"
          disabled={isLoading}
        >
          <RefreshCcw className="h-4 w-4 mr-1" />
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Doctors"
          value={dashboardData.stats.totalDoctors}
          subtext={`${dashboardData.stats.activeDoctors} active`}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          icon={<User className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="Total Appointments"
          value={dashboardData.stats.totalAppointments}
          subtext={`${dashboardData.stats.pendingAppointments} active`}
          bgColor="bg-green-50"
          textColor="text-green-600"
          icon={<Calendar className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="Today's Appointments"
          value={dashboardData.stats.todayAppointments}
          subtext={`${dashboardData.stats.paidAppointments} paid`}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
          icon={<Clock className="h-6 w-6 text-purple-500" />}
        />
        <StatCard
          title="Total Revenue"
          value={`${currencySymbol}${dashboardData.stats.totalRevenue.toLocaleString()}`}
          subtext="From paid appointments only"
          bgColor="bg-amber-50"
          textColor="text-amber-600"
          icon={<BadgeIndianRupee className="h-6 w-6 text-amber-500" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line Chart - Appointments Over Time */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Appointments Over Time</h2>
            </div>
            <div className="text-sm text-gray-500">
              Paid appointments only
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboardData.appointmentsByDay}
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(
                    dashboardData.appointmentsByDay.length / 10
                  )}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Appointments"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Revenue Over Time */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Revenue Over Time</h2>
            </div>
            <div className="text-sm text-gray-500">
              Paid appointments only
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.appointmentsByDay}
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(
                    dashboardData.appointmentsByDay.length / 10
                  )}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${currencySymbol}${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart - Appointments by Specialty */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <PieChart className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Appointments by Specialty</h2>
            </div>
            <div className="text-sm text-gray-500">
              Paid appointments only
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={dashboardData.specialtyStats.map((s) => ({
                    name: s.name,
                    value: s.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {dashboardData.specialtyStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} appointments`, `Count`]}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Revenue by Specialty */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Revenue by Specialty</h2>
            </div>
            <div className="text-sm text-gray-500">
              Paid appointments only
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.specialtyStats.map((s) => ({
                  name: s.name,
                  value: s.revenue,
                }))}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [
                    `${currencySymbol}${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Doctors */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <Stethoscope className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Top Performing Doctors</h2>
            </div>
            <div className="text-sm text-gray-500">
              Paid appointments only
            </div>
          </div>
          <div className="space-y-4">
            {dashboardData.topDoctors && dashboardData.topDoctors.length > 0 ? (
              dashboardData.topDoctors.map((doctor, idx) => (
                <div key={idx} className="flex items-center p-2 border-b">
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/40";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {doctor.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {doctor.speciality}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {doctor.appointments} apps
                    </div>
                    <div className="text-xs text-amber-600">
                      {currencySymbol}
                      {doctor.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No doctor performance data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium">Recent Appointments</h2>
            </div>
            <Link
              to="/all-appointments"
              className="text-primary text-sm hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            {!dashboardData.latestAppointments ||
            dashboardData.latestAppointments.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">
                No recent appointments
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.latestAppointments.map((appointment, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full overflow-hidden mr-3 bg-gray-200">
                            <img
                              src={appointment.userData?.image}
                              alt={appointment.userData?.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/40";
                              }}
                            />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.userData?.name || "Unknown Patient"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.docData?.name || "Unknown Doctor"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.docData?.speciality ||
                            "Unknown Specialty"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.slotDate
                            ? slotDate(appointment.slotDate)
                            : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.slotTime || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {currencySymbol}
                        {appointment.amount?.toLocaleString() || "0"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {appointment.isCancelled ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Cancelled
                          </span>
                        ) : appointment.payment ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Paid
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtext, bgColor, textColor, icon }) => {
  return (
    <div
      className={`${bgColor} rounded-lg p-5 shadow-sm border border-gray-100`}
    >
      <div className="flex justify-between">
        <div className="flex flex-col">
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <h3 className={`${textColor} text-2xl font-bold`}>{value}</h3>
          {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
        </div>
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;