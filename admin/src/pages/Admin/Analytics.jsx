import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart, Activity, Calendar } from "lucide-react";

const Analytics = () => {
  const { aToken, backendURL } = useContext(AdminContext);

  const [granularity, setGranularity] = useState("daily");
  const [revenueData, setRevenueData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [demandData, setDemandData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch Revenue Trends
      const revenueRes = await axios.get(
        `${backendURL}/api/admin/revenue-trends?granularity=${granularity}`,
        { headers: { Authorization: `Bearer ${aToken}` } },
      );
      if (revenueRes.data.success) {
        setRevenueData(revenueRes.data.data);
      }

      // Fetch Peak Booking Analysis
      const bookingRes = await axios.get(
        `${backendURL}/api/admin/peak-booking-analysis`,
        { headers: { Authorization: `Bearer ${aToken}` } },
      );
      if (bookingRes.data.success) {
        setBookingData(bookingRes.data.data);
      }

      // Fetch Peak Demand Visualization
      const demandRes = await axios.get(
        `${backendURL}/api/admin/peak-demand-visualization`,
        { headers: { Authorization: `Bearer ${aToken}` } },
      );
      if (demandRes.data.success) {
        setDemandData(demandRes.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchAnalytics();
    }
  }, [aToken, granularity]);

  // Heatmap rendering helpers
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  const getHeatmapColor = (value, max) => {
    if (!value) return "bg-gray-50";
    const intensity = value / max;
    if (intensity < 0.25) return "bg-[#bfe1e8]"; // light primary
    if (intensity < 0.5) return "bg-[#7fbccc]";
    if (intensity < 0.75) return "bg-[#3e97b1]";
    return "bg-[#1A6E80]"; // Primary color
  };

  const renderHeatmap = (data, title, description) => {
    const maxVal = Math.max(...data.map((d) => d.value), 1);

    // Create matrix
    const matrix = Array(7)
      .fill(0)
      .map(() => Array(24).fill(0));
    data.forEach((item) => {
      // API returns day 1-7, hours 0-23
      const dIndex = item.day - 1;
      const hIndex = item.hour;
      if (dIndex >= 0 && dIndex < 7 && hIndex >= 0 && hIndex < 24) {
        matrix[dIndex][hIndex] = item.value;
      }
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{description}</p>

        <div className="min-w-[800px]">
          <div className="flex">
            <div className="w-12"></div>
            <div className="flex-1 flex justify-between px-2 text-xs text-gray-500 pb-2">
              {hoursOfDay.map((h) => (
                <div key={h} className="w-8 text-center">
                  {h}:00
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {daysOfWeek.map((day, dIdx) => (
              <div key={day} className="flex items-center">
                <div className="w-12 text-sm font-medium text-gray-600">
                  {day}
                </div>
                <div className="flex-1 flex justify-between px-2 gap-1">
                  {hoursOfDay.map((hIdx) => {
                    const val = matrix[dIdx][hIdx];
                    return (
                      <div
                        key={`${dIdx}-${hIdx}`}
                        className={`w-8 h-8 rounded-sm ${getHeatmapColor(val, maxVal)} flex items-center justify-center transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-primary`}
                        title={`${day} at ${hIdx}:00 - ${val} bookings`}
                      >
                        {val > 0 && (
                          <span className="text-[10px] text-white font-bold opacity-0 hover:opacity-100">
                            {val}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-sm bg-gray-50 border border-gray-100"></div>
              <div className="w-4 h-4 rounded-sm bg-[#bfe1e8]"></div>
              <div className="w-4 h-4 rounded-sm bg-[#7fbccc]"></div>
              <div className="w-4 h-4 rounded-sm bg-[#3e97b1]"></div>
              <div className="w-4 h-4 rounded-sm bg-[#1A6E80]"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading && revenueData.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="m-5 max-w-6xl w-full">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
          <BarChart className="text-primary" size={32} />
          <span className="text-gray-800">Analytics</span>{" "}
          <span className="text-primary">Dashboard</span>
        </h2>
        <p className="text-gray-600">
          In-depth insights into revenue trends and booking patterns.
        </p>
      </div>

      {/* Revenue Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Revenue Trends
            </h3>
            <p className="text-gray-500 text-sm">
              Completed and paid appointments over time.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setGranularity("daily")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${granularity === "daily" ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Daily
            </button>
            <button
              onClick={() => setGranularity("weekly")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${granularity === "weekly" ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setGranularity("monthly")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${granularity === "monthly" ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  dx={-10}
                  tickFormatter={(val) => `$${val}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  dx={10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value, name) => {
                    if (name === "Revenue") return [`$${value}`, name];
                    return [value, name];
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#1A6E80"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="appointments"
                  name="Appointments"
                  stroke="#E69B0F"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <Calendar className="mr-2 opacity-50" /> No data available for
              this period.
            </div>
          )}
        </div>
      </div>

      {/* Heatmaps */}
      <div className="flex flex-col gap-8">
        {renderHeatmap(
          bookingData,
          "Peak Booking Time Analysis",
          "When are patients actually submitting their bookings? (Based on day/time the booking was created)",
        )}

        {renderHeatmap(
          demandData,
          "Peak Demand Visualization",
          "When are patients requesting to see doctors? (Based on the scheduled appointment date and time)",
        )}
      </div>
    </div>
  );
};

export default Analytics;
