import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import {
  ChevronLeft,
  ChevronRight,
  XCircle,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Search,
  RefreshCw,
} from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleRefresh = () => {
    loadAppointments(currentPage, pageSize);
  };

  const filteredAppointments = appointments.filter(
    (item) =>
      item.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.docData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.docData.speciality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status badge component
  const StatusBadge = ({ isPaid, isCancelled }) => {
    if (isCancelled) {
      return (
        <span className="text-red-600 text-xs font-medium px-2 py-1 bg-red-50 rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          <span>Cancelled</span>
        </span>
      );
    } else if (isPaid) {
      return (
        <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          <span>Paid</span>
        </span>
      );
    } else {
      return (
        <span className="text-yellow-600 text-xs font-medium px-2 py-1 bg-yellow-50 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Unpaid</span>
        </span>
      );
    }
  };

  return (
    <div className="w-full h-auto min-h-screen p-4 lg:p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              All Appointments
            </h2>
            <p className="text-gray-500 mt-1">
              Manage and track all patient appointments
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search appointments..."
                className="pl-9 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-2 bg-gray-50 p-3 border-b text-sm">
            <div className="col-span-1 font-medium text-gray-500">#</div>
            <div className="col-span-2 font-medium text-gray-500">Patient</div>
            <div className="col-span-1 font-medium text-gray-500">Age</div>
            <div className="col-span-2 font-medium text-gray-500">
              Date & Time
            </div>
            <div className="col-span-3 font-medium text-gray-500">Doctor</div>
            <div className="col-span-1 font-medium text-gray-500">Fee</div>
            <div className="col-span-2 font-medium text-gray-500 text-center">
              Status/Action
            </div>
          </div>

          {/* Appointments List */}
          <div className="divide-y">
            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Users className="w-12 h-12 text-gray-300 mb-2" />
                <p>No appointments found</p>
              </div>
            ) : (
              filteredAppointments.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 hover:bg-gray-50 transition-colors text-sm"
                >
                  {/* Mobile Header */}
                  <div className="md:hidden flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">
                      Appointment #{(currentPage - 1) * pageSize + index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <StatusBadge
                        isPaid={item.payment}
                        isCancelled={item.isCancelled}
                      />
                    </div>
                  </div>

                  {/* Appointment Number */}
                  <div className="hidden md:flex items-center col-span-1 text-gray-700">
                    {(currentPage - 1) * pageSize + index + 1}
                  </div>

                  {/* Patient Info */}
                  <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border">
                      <img
                        src={item.userData.image}
                        alt={item.userData.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/32?text=User";
                        }}
                      />
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-gray-800 truncate">
                        {item.userData.name}
                      </p>
                      <p className="text-xs text-gray-500 md:hidden">
                        Age: {calculateAge(item.userData.dob)}
                      </p>
                    </div>
                  </div>

                  {/* Age */}
                  <div className="hidden md:flex items-center col-span-1 text-gray-700">
                    {calculateAge(item.userData.dob)}
                  </div>

                  {/* Date & Time */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="font-medium text-gray-700 truncate">
                        {slotDate(item.slotDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500 truncate">
                        {item.slotTime}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="col-span-1 md:col-span-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border">
                      <img
                        src={item.docData.image}
                        alt={item.docData.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/28?text=Dr";
                        }}
                      />
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-gray-800 truncate">
                        {item.docData.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.docData.speciality}
                      </p>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="col-span-1 flex items-center text-gray-700">
                    <span className="flex items-center truncate">
                      {currencySymbol}
                      {item.amount}
                    </span>
                  </div>

                  {/* Status/Action */}
                  <div className="col-span-1 md:col-span-2 flex items-center justify-end md:justify-center">
                    <div className="flex space-x-1 items-center">
                      <div className="hidden md:block">
                        <StatusBadge
                          isPaid={item.payment}
                          isCancelled={item.isCancelled}
                        />
                      </div>

                      {!item.isCancelled && (
                        <button
                          onClick={() => cancelAppointment(item._id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Cancel appointment"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {pagination && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-gray-50 border-t gap-3 text-sm">
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <span className="text-gray-700 whitespace-nowrap">
                  Showing{" "}
                  <span className="font-medium">
                    {filteredAppointments.length > 0
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
                <div className="ml-0 sm:ml-2 w-full sm:w-auto">
                  <select
                    className="border-gray-300 rounded-md w-full sm:w-auto text-sm"
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
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`p-1 rounded-md ${
                    pagination.hasPrevPage
                      ? "text-gray-700 hover:bg-gray-200"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
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
                          className={`px-2 py-1 mx-0.5 text-xs rounded-md ${
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
                          className="px-2 py-1 mx-0.5 text-xs text-gray-500"
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
                  className={`p-1 rounded-md ${
                    pagination.hasNextPage
                      ? "text-gray-700 hover:bg-gray-200"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllAppointments;
