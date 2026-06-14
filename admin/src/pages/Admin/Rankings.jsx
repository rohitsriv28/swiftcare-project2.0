import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Trophy, Star, TrendingUp, Users, Medal } from "lucide-react";

const Rankings = () => {
  const { aToken, backendURL } = useContext(AdminContext);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    try {
      const { data } = await axios.get(
        backendURL + "/api/admin/all-doctor-performance",
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (data.success) {
        setRankings(data.data);
      } else {
        toast.error("Failed to fetch rankings");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to fetch rankings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchRankings();
    }
  }, [aToken]);

  const getRankStyles = (index) => {
    if (index === 0) return { color: "text-yellow-500", bg: "bg-yellow-50", badge: "Gold" };
    if (index === 1) return { color: "text-gray-400", bg: "bg-gray-50", badge: "Silver" };
    if (index === 2) return { color: "text-amber-600", bg: "bg-amber-50", badge: "Bronze" };
    return { color: "text-gray-500", bg: "bg-white", badge: `#${index + 1}` };
  };

  if (loading) {
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
          <Trophy className="text-primary" size={32} />
          <span className="text-gray-800">Doctor</span>{" "}
          <span className="text-primary">Rankings</span>
        </h2>
        <p className="text-gray-600">
          Performance scores based on appointments, revenue, and patient ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {rankings.slice(0, 3).map((doc, index) => {
          const styles = getRankStyles(index);
          return (
            <div
              key={doc.doctorId}
              className={`rounded-xl shadow-sm overflow-hidden border border-gray-100 ${styles.bg} transform hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={doc.doctor.image}
                    alt={doc.doctor.name}
                    className="w-24 h-24 rounded-full object-cover shadow-sm border-4 border-white"
                  />
                  <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md ${styles.color}`}>
                    <Medal size={20} />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800">Dr. {doc.doctor.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{doc.doctor.speciality}</p>
                
                <div className="w-full mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Composite Score</span>
                    <span className="font-bold text-primary">{doc.scores.totalScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-primary"}`}
                      style={{ width: `${doc.scores.totalScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-gray-200/60">
                  <div className="flex flex-col items-center">
                    <Users size={16} className="text-blue-500 mb-1" />
                    <span className="text-xs font-semibold">{doc.completedAppointments}</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-r border-gray-200/60">
                    <TrendingUp size={16} className="text-green-500 mb-1" />
                    <span className="text-xs font-semibold">${doc.revenue}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Star size={16} className="text-amber-400 mb-1" />
                    <span className="text-xs font-semibold">{doc.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Complete Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Rank</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Speciality</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Appointments</th>
                <th className="px-6 py-4 rounded-tr-lg text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((doc, index) => (
                <tr key={doc.doctorId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-500">#{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={doc.doctor.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <span className="font-medium text-gray-800">Dr. {doc.doctor.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{doc.doctor.speciality}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} className="fill-current" />
                      <span className="font-medium">{doc.averageRating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{doc.completedAppointments}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                      {doc.scores.totalScore}
                    </span>
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

export default Rankings;
