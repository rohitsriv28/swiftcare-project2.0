import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Star, Award, Calendar, BadgeCheck, Clock, MapPin } from "lucide-react";

const RecommendedDocs = () => {
  const { backendUrl, token, currencySymbol } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Only fetch if logged in
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          backendUrl + "/api/user/recommendations",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (data.success) {
          setDoctors(data.data.slice(0, 5)); // Show top 5
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [backendUrl, token]);

  if (!token || loading || doctors.length === 0) {
    return null;
  }

  const topMatch = doctors[0];
  const otherMatches = doctors.slice(1);

  return (
    <div className="w-full flex flex-col items-center gap-6 my-10 text-gray-900 px-4 md:px-10">
      <div className="w-full text-left">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3 text-primary">
          <BadgeCheck size={32} className="text-yellow-500" />
          Recommended For You
        </h2>
        <p className="text-gray-600 sm:w-1/2 text-sm">
          Based on your preferences, these specialists rank highly in rating,
          availability, and affordability.
        </p>
      </div>

      <div className="w-full relative">
        <div
          className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Top Match Card */}
          <div
            onClick={() => {
              navigate(`/appointment/${topMatch._id}`);
              window.scrollTo(0, 0);
            }}
            className="flex-shrink-0 w-80 md:w-96 rounded-2xl overflow-hidden border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white shadow-lg cursor-pointer transform hover:-translate-y-2 transition-all duration-300 snap-center relative"
          >
            <div className="absolute top-0 left-0 w-full bg-yellow-400 text-yellow-900 text-xs font-bold py-1.5 px-4 flex justify-between items-center z-10 shadow-sm">
              <span className="flex items-center gap-1">
                <Award size={14} /> TOP MATCH
              </span>
              <span>Score: {topMatch.recommendationScore.toFixed(1)}</span>
            </div>

            <div className="pt-10 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={topMatch.image}
                    alt=""
                    className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover bg-blue-50"
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {topMatch.name}
                  </h3>
                  <p className="text-primary font-medium">
                    {topMatch.speciality}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <span className="font-medium">
                    {topMatch.averageRating
                      ? topMatch.averageRating.toFixed(1)
                      : "New"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award size={16} className="text-gray-400" />
                  <span>{topMatch.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Highly Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {currencySymbol}{topMatch.fee}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Other Matches */}
          {otherMatches.map((doc, index) => (
            <div
              key={doc._id}
              onClick={() => {
                navigate(`/appointment/${doc._id}`);
                window.scrollTo(0, 0);
              }}
              className="flex-shrink-0 w-72 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md cursor-pointer transform hover:-translate-y-1 transition-all duration-300 snap-center relative mt-2"
            >
              <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-semibold py-1 px-3 rounded-bl-lg">
                Match #{index + 2}
              </div>

              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={doc.image}
                    alt=""
                    className="w-16 h-16 rounded-full border border-gray-100 object-cover bg-blue-50"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-primary">{doc.speciality}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="font-medium">
                      {doc.averageRating ? doc.averageRating.toFixed(1) : "N/A"}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {currencySymbol}{doc.fee}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedDocs;
