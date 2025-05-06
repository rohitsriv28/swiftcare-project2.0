import React, { useState } from "react";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { useEffect } from "react";
import { assets } from "../../assets/assets";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AllAppointments = () => {
  const {
    aToken,
    appointments,
    getAllAppointments,
    cancelAppointment,
    pagination,
  } = useContext(AdminContext);
  const { currencySymbol, calculateAge, slotDate } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (aToken) {
      loadAppointments(currentPage, pageSize);
    }
  }, [aToken, currentPage, pageSize]);

  const loadAppointments = (page, limit) => {
    getAllAppointments(page, limit);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">All Appointments</h2>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 p-4 border-b">
          <div className="col-span-1 font-medium text-gray-500">#</div>
          <div className="col-span-3 font-medium text-gray-500">Patient</div>
          <div className="col-span-1 font-medium text-gray-500">Age</div>
          <div className="col-span-2 font-medium text-gray-500">
            Date & Time
          </div>
          <div className="col-span-3 font-medium text-gray-500">Doctor</div>
          <div className="col-span-1 font-medium text-gray-500">Fee</div>
          <div className="col-span-1 font-medium text-gray-500">Status</div>
        </div>

        {/* Appointments List */}
        <div className="divide-y">
          {appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No appointments found
            </div>
          ) : (
            appointments.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Mobile Header */}
                <div className="md:hidden flex justify-between items-center">
                  <span className="font-medium">
                    Appointment #{(currentPage - 1) * pageSize + index + 1}
                  </span>
                  <div className="flex items-center space-x-2">
                    {item.payment ? (
                      <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full">
                        Paid
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-xs font-medium px-2 py-1 bg-yellow-50 rounded-full">
                        Unpaid
                      </span>
                    )}
                    {item.isCancelled ? (
                      <span className="text-red-400 text-xs font-medium px-2 py-1 bg-red-50 rounded-full">
                        Cancelled
                      </span>
                    ) : (
                      <button className="text-red-400 hover:text-red-500">
                        <img
                          onClick={() => cancelAppointment(item._id)}
                          src={assets.cancel_icon}
                          alt="Cancel"
                          className="w-5 h-5"
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Appointment Number */}
                <div className="hidden md:flex items-center col-span-1">
                  {(currentPage - 1) * pageSize + index + 1}
                </div>

                {/* Patient Info */}
                <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                  <img
                    src={item.userData.image}
                    alt={item.userData.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{item.userData.name}</p>
                    <p className="text-xs text-gray-500 md:hidden">
                      Age: {calculateAge(item.userData.dob)}
                    </p>
                  </div>
                </div>

                {/* Age */}
                <div className="hidden md:flex items-center col-span-1">
                  {calculateAge(item.userData.dob)}
                </div>

                {/* Date & Time */}
                <div className="col-span-1 md:col-span-2">
                  <p className="font-medium">{slotDate(item.slotDate)}</p>
                  <p className="text-sm text-gray-500">{item.slotTime}</p>
                </div>

                {/* Doctor Info */}
                <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                  <img
                    src={item.docData.image}
                    alt={item.docData.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{item.docData.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.docData.speciality}
                    </p>
                  </div>
                </div>

                {/* Fee */}
                <div className="col-span-1 flex items-center">
                  <span className="font-medium">
                    {currencySymbol}
                    {item.amount}
                  </span>
                </div>

                {/* Status/Action */}
                <div className="col-span-1 flex items-center justify-end md:justify-start">
                  {item.isCancelled ? (
                    <span className="hidden md:inline text-red-400 text-xs font-medium px-2 py-1 bg-red-50 rounded-full">
                      Cancelled
                    </span>
                  ) : item.payment ? (
                    <span className="hidden md:inline text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full">
                      Paid
                    </span>
                  ) : (
                    <div className="flex space-x-2">
                      <span className="hidden md:inline text-yellow-600 text-xs font-medium px-2 py-1 bg-yellow-50 rounded-full">
                        Unpaid
                      </span>
                      <button
                        className="hidden md:inline hover:bg-gray-100 p-1 rounded"
                        title="Cancel appointment"
                      >
                        <img
                          onClick={() => cancelAppointment(item._id)}
                          src={assets.cancel_icon}
                          alt="Cancel"
                          className="w-5 h-5"
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && (
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {appointments.length > 0
                    ? (pagination.page - 1) * pagination.limit + 1
                    : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span>{" "}
                results
              </span>
              <div className="ml-4">
                <select
                  className="text-sm border-gray-300 rounded-md"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className={`p-1 rounded ${
                  pagination.hasPrevPage
                    ? "text-gray-700 hover:bg-gray-200"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex">
                {[...Array(pagination.totalPages)].map((_, index) => {
                  // Show limited page numbers with ellipsis for better UX
                  const pageNum = index + 1;
                  const isCurrentPage = pageNum === pagination.page;
                  const isWithinRange =
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    Math.abs(pageNum - pagination.page) <= 1;

                  if (isWithinRange) {
                    return (
                      <button
                        key={index}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 mx-1 text-sm rounded ${
                          isCurrentPage
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === 2 && pagination.page > 3) ||
                    (pageNum === pagination.totalPages - 1 &&
                      pagination.page < pagination.totalPages - 2)
                  ) {
                    return (
                      <span
                        key={index}
                        className="px-3 py-1 mx-1 text-sm text-gray-500"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className={`p-1 rounded ${
                  pagination.hasNextPage
                    ? "text-gray-700 hover:bg-gray-200"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAppointments;
