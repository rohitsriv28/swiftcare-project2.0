import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  CreditCard, 
  DollarSign, 
  XCircle, 
  CheckCircle, 
  Loader2,
  AlertTriangle
} from "lucide-react";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);
  const navigate = useNavigate();
  
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formattedSlotDate = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };
  
  const getUserAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    setCancellingId(appointmentId);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  const initPayment = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Doctor's Appointment Payment",
      description: "Appointment Payment at SwiftCare",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);
        try {
          setProcessingPaymentId(order.receipt);
          const { data } = await axios.post(
            backendUrl + "/api/user/verify-payment",
            response,
            { headers: { token } }
          );
          if (data.success) {
            toast.success("Payment successful!");
            getUserAppointments();
            navigate("/my-appointments");
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message || "Payment verification failed");
        } finally {
          setProcessingPaymentId(null);
        }
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePayment = async (appointmentId) => {
    setProcessingPaymentId(appointmentId);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/pay-with-razorpay",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        console.log(data.order);
        initPayment(data.order);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Payment initiation failed");
      setProcessingPaymentId(null);
    }
  };
  
  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);
  
  // Group appointments by status
  const getAppointmentsByStatus = () => {
    const upcoming = appointments.filter(
      appointment => !appointment.isCancelled && !appointment.isComplete
    );
    
    const completed = appointments.filter(
      appointment => !appointment.isCancelled && appointment.isComplete
    );
    
    const cancelled = appointments.filter(
      appointment => appointment.isCancelled
    );
    
    return { upcoming, completed, cancelled };
  };
  
  const { upcoming, completed, cancelled } = getAppointmentsByStatus();
  
  // Status badge component
  const StatusBadge = ({ status, paymentMethod }) => {
    if (status === "completed") {
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
          <CheckCircle size={14} />
          <span>Completed</span>
          {paymentMethod && (
            <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full ml-1">
              {paymentMethod}
            </span>
          )}
        </div>
      );
    } else if (status === "cancelled") {
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full">
          <XCircle size={14} />
          <span>Cancelled</span>
        </div>
      );
    } else if (status === "paid") {
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
          <CreditCard size={14} />
          <span>Paid Online</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
        <AlertTriangle size={14} />
        <span>Payment Pending</span>
      </div>
    );
  };

  // Display empty state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-sm p-8">
        <Calendar size={64} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
        <p className="text-gray-600 text-center max-w-md mb-6">
          You don't have any appointments scheduled. Book an appointment with one of our specialists to get started.
        </p>
        <button 
          onClick={() => navigate('/doctors')}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-all duration-300"
        >
          Find a Doctor
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-gray-800">My</span>{" "}
          <span className="text-primary">Appointments</span>
        </h2>
        <div className="w-20 h-1 bg-primary mb-6"></div>
      </div>
      
      {/* Upcoming Appointments */}
      {upcoming.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Upcoming Appointments
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            {upcoming.map((item, index) => (
              <div
                key={index}
                className={`p-4 ${
                  index !== upcoming.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Doctor Image */}
                  <div className="sm:w-36 h-32 sm:h-36 flex-shrink-0">
                    <div className="relative h-full w-full">
                      <img
                        src={item.docData.image}
                        alt={item.docData.name}
                        className="h-full w-full object-cover rounded-lg shadow-sm bg-indigo-50"
                      />
                    </div>
                  </div>
                  
                  {/* Appointment Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Dr. {item.docData.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Award size={14} className="text-primary" />
                          <span className="text-gray-700">{item.docData.speciality}</span>
                        </div>
                      </div>
                      
                      <StatusBadge 
                        status={item.payment ? "paid" : "pending"} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span>{formattedSlotDate(item.slotDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} />
                        <span>{item.slotTime}</span>
                      </div>
                      
                      <div className="flex items-start gap-2 text-gray-600 col-span-1 sm:col-span-2 mt-1">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          {item.docData.address?.line1}
                          {item.docData.address?.line2 && (
                            <span>, {item.docData.address.line2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      {!item.payment && (
                        <button
                          onClick={() => handlePayment(item._id)}
                          disabled={processingPaymentId === item._id}
                          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {processingPaymentId === item._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CreditCard size={14} />
                          )}
                          Pay Online
                        </button>
                      )}
                      
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        disabled={cancellingId === item._id}
                        className="flex items-center gap-2 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {cancellingId === item._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Completed Appointments */}
      {completed.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            Completed Appointments
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            {completed.map((item, index) => (
              <div
                key={index}
                className={`p-4 ${
                  index !== completed.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Doctor Image */}
                  <div className="sm:w-36 h-32 sm:h-36 flex-shrink-0">
                    <div className="relative h-full w-full">
                      <img
                        src={item.docData.image}
                        alt={item.docData.name}
                        className="h-full w-full object-cover rounded-lg shadow-sm bg-indigo-50"
                      />
                    </div>
                  </div>
                  
                  {/* Appointment Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Dr. {item.docData.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Award size={14} className="text-primary" />
                          <span className="text-gray-700">{item.docData.speciality}</span>
                        </div>
                      </div>
                      
                      <StatusBadge 
                        status="completed" 
                        paymentMethod={item.payment ? "Online Payment" : "Cash Payment"}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span>{formattedSlotDate(item.slotDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} />
                        <span>{item.slotTime}</span>
                      </div>
                      
                      <div className="flex items-start gap-2 text-gray-600 col-span-1 sm:col-span-2 mt-1">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          {item.docData.address?.line1}
                          {item.docData.address?.line2 && (
                            <span>, {item.docData.address.line2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Cancelled Appointments */}
      {cancelled.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <XCircle size={18} className="text-red-500" />
            Cancelled Appointments
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 opacity-75">
            {cancelled.map((item, index) => (
              <div
                key={index}
                className={`p-4 ${
                  index !== cancelled.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Doctor Image */}
                  <div className="sm:w-36 h-32 sm:h-36 flex-shrink-0">
                    <div className="relative h-full w-full">
                      <img
                        src={item.docData.image}
                        alt={item.docData.name}
                        className="h-full w-full object-cover rounded-lg shadow-sm bg-indigo-50 grayscale"
                      />
                    </div>
                  </div>
                  
                  {/* Appointment Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-700">
                          Dr. {item.docData.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Award size={14} className="text-gray-500" />
                          <span className="text-gray-600">{item.docData.speciality}</span>
                        </div>
                      </div>
                      
                      <StatusBadge status="cancelled" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={14} />
                        <span>{formattedSlotDate(item.slotDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={14} />
                        <span>{item.slotTime}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button
                        onClick={() => navigate(`/appointment/${item.docData._id}`)}
                        className="flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-all"
                      >
                        <Calendar size={14} />
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;