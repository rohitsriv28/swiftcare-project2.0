import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";

const DoctorAppointment = () => {
  const {
    dToken,
    docAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);
  const { calculateAge, slotDate, currencySymbol } = useContext(AppContext);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (dToken) {
        try {
          await getAppointments();
        } catch (error) {
          toast.error("Failed to fetch appointments");
          console.error(error);
        }
      }
    };

    fetchAppointments();
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All My Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <div className="max:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment Status</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {docAppointments && docAppointments.length > 0 ? (
          [...docAppointments].reverse().map((item, index) => (
            <div
              key={index}
              className="flex flex-wrap justify-between max-sm:gap5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            >
              <p className="max-sm:hidden">{index + 1}</p>
              <div className="flex items-center gap-2">
                <img
                  src={item.userData?.image || "/default-user.png"}
                  alt="Patient"
                  className="w-10 rounded-full"
                />
                <p>{item.userData?.name}</p>
              </div>
              <div>
                <p
                  className={`text-xs inline border px-2 rounded-full ${
                    item.payment
                      ? "border-green-500 text-green-600 bg-green-50"
                      : "border-blue-500 text-blue-600 bg-blue-50"
                  }`}
                >
                  {item.payment ? "Online" : "Cash"}
                </p>
              </div>
              <p className="max-sm:hidden">
                {item.userData?.dob ? calculateAge(item.userData.dob) : "N/A"}
              </p>
              <p>
                {slotDate(item.slotDate)}, {item.slotTime}
              </p>
              <p>
                {currencySymbol}
                {item.amount}
              </p>
              {item.isCancelled ? (
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Cancelled
                  </span>
                </div>
              ) : item.isComplete ? (
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => completeAppointment(item._id)}
                    className="w-8 h-8 p-1 cursor-pointer hover:bg-green-100 rounded-full flex items-center justify-center"
                    title="Mark as completed"
                  >
                    <CheckCircle className="text-green-600" size={20} />
                  </button>
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="w-8 h-8 p-1 cursor-pointer hover:bg-red-100 rounded-full flex items-center justify-center"
                    title="Cancel appointment"
                  >
                    <XCircle className="text-red-600" size={20} />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointment;
