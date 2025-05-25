import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  ArrowLeft,
  Calendar,
  Shield,
  Star,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

const VerifyKhalti = () => {
  const [status, setStatus] = useState("verifying");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, token, setPaymentStatus } = useContext(AppContext);
  const [appointmentId, setAppointmentId] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "verifying") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + 5;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const params = new URLSearchParams(location.search);
    const pidx = params.get("pidx");
    let appointmentId = params.get("appointmentId");

    // Retrieve stored session data
    const storedSession = sessionStorage.getItem("khalti_payment_session");
    let sessionData = null;

    if (storedSession) {
      sessionData = JSON.parse(storedSession);

      // Use the stored appointmentId if it exists and pidx matches
      if (sessionData.pidx === pidx) {
        appointmentId = sessionData.appointmentId;
      }

      // Clean up the session storage
      sessionStorage.removeItem("khalti_payment_session");
    }

    if (!pidx || !appointmentId) {
      setStatus("error");
      toast.error("Missing payment verification parameters");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/verify-khalti`,
        { pidx, appointmentId },
        { headers: { token } }
      );

      if (response.data.success) {
        setStatus("success");
        setProgress(100);
        setPaymentStatus("completed");

        // Handle amount conversion properly
        const responseData = response.data.data;
        const amountInNPR = responseData.amount
          ? responseData.amount >= 100
            ? responseData.amount / 100
            : responseData.amount
          : 0;

        setPaymentDetails({
          ...responseData,
          total_amount: amountInNPR,
        });
        setAppointmentId(appointmentId);
      } else {
        throw new Error(response.data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      toast.error(
        error.response?.data?.message || "Payment verification failed"
      );
      setStatus("error");
      setPaymentStatus("failed");
    }
  };

  const copyTransactionId = async (transactionId) => {
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopied(true);
      toast.success("Transaction ID copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = transactionId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopied(true);
      toast.success("Transaction ID copied to clipboard!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const statusConfig = {
    verifying: {
      icon: <Loader2 className="animate-spin" />,
      title: "Verifying Your Payment",
      subtitle: "Securing your transaction...",
      message: "Please wait while we confirm your Khalti payment securely",
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
      borderColor: "border-blue-200",
      gradientFrom: "from-blue-500",
      gradientTo: "to-purple-600",
    },
    success: {
      icon: <CheckCircle />,
      title: "Payment Successful!",
      subtitle: "Transaction completed successfully",
      message: "Your appointment has been confirmed.",
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      gradientFrom: "from-green-500",
      gradientTo: "to-emerald-600",
      action: {
        primary: {
          text: "View Appointments",
          onClick: () => navigate("/my-appointments"),
          icon: <Calendar className="mr-2 h-5 w-5" />,
        },
        secondary: {
          text: "Return Home",
          onClick: () => navigate("/"),
          icon: <ArrowLeft className="mr-2 h-5 w-5" />,
        },
      },
    },
    error: {
      icon: <AlertCircle />,
      title: "Payment Verification Failed",
      subtitle: "Something went wrong",
      message:
        "We couldn't verify your payment. Don't worry, if money was deducted, it will be refunded within 24 hours.",
      color: "text-red-600",
      bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
      borderColor: "border-red-200",
      gradientFrom: "from-red-500",
      gradientTo: "to-pink-600",
      action: {
        primary: {
          text: "Try Again",
          onClick: () => window.location.reload(),
          icon: <CreditCard className="mr-2 h-5 w-5" />,
        },
        secondary: {
          text: "Return to Appointments",
          onClick: () => navigate("/my-appointments"),
          icon: <ArrowLeft className="mr-2 h-5 w-5" />,
        },
      },
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Card */}
      <div
        className={`relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border-t-4 ${currentStatus.borderColor} transition-all duration-500 transform hover:scale-105`}
      >
        {/* Status Icon */}
        <div className="relative mb-6">
          <div
            className={`relative inline-flex p-6 rounded-full ${currentStatus.bgColor} shadow-lg`}
          >
            <span className={`text-4xl ${currentStatus.color} relative z-10`}>
              {currentStatus.icon}
            </span>
            {status === "success" && (
              <>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-20 animate-ping"></div>
                <Sparkles
                  className="absolute -top-2 -right-2 text-yellow-400 w-6 h-6 animate-bounce"
                  fill="currentColor"
                />
                <Star
                  className="absolute -bottom-1 -left-1 text-yellow-400 w-4 h-4 animate-pulse"
                  fill="currentColor"
                />
              </>
            )}
          </div>
        </div>

        {/* Status Content */}
        <div className="space-y-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentStatus.title}
          </h2>
          <p className={`text-lg font-medium ${currentStatus.color}`}>
            {currentStatus.subtitle}
          </p>
          <p className="text-gray-600 leading-relaxed max-w-md mx-auto text-sm">
            {currentStatus.message}
          </p>
        </div>

        {/* Progress Bar */}
        {status === "verifying" && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className={`h-full bg-gradient-to-r ${currentStatus.gradientFrom} ${currentStatus.gradientTo} rounded-full transition-all duration-300 relative`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{progress}% Complete</p>
          </div>
        )}

        {/* Payment Details */}
        {paymentDetails && (status === "success" || status === "error") && (
          <div className="mb-6 bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Payment Details
              </h3>
              <div className="flex items-center gap-1">
                <img
                  src="https://web.khalti.com/static/img/logo1.png"
                  alt="Khalti"
                  className="w-6 h-6 object-contain"
                />
                <span className="text-purple-600 font-semibold text-xs">
                  Khalti
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Transaction ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-gray-800 bg-white px-2 py-1 rounded text-xs">
                    {paymentDetails.transaction_id ||
                      paymentDetails.pidx ||
                      "N/A"}
                  </span>
                  {(paymentDetails.transaction_id || paymentDetails.pidx) && (
                    <button
                      onClick={() =>
                        copyTransactionId(
                          paymentDetails.transaction_id || paymentDetails.pidx
                        )
                      }
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                        copied
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                      }`}
                      title={copied ? "Copied!" : "Copy Transaction ID"}
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Appointment ID:</span>
                <span className="font-semibold text-gray-800">
                  #{appointmentId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-lg text-green-600">
                  रु.{" "}
                  {paymentDetails.total_amount > 0
                    ? paymentDetails.total_amount.toFixed(2)
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 ${
                      status === "success" ? "bg-green-500" : "bg-red-500"
                    } rounded-full ${
                      status === "success" ? "animate-pulse" : ""
                    }`}
                  ></div>
                  <span
                    className={`font-semibold ${
                      status === "success" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {status === "success" ? "Completed" : "Failed"}
                  </span>
                </div>
              </div>
            </div>

            {status === "success" && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 text-center">
                  ✅ Payment verified and appointment confirmed successfully
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {currentStatus.action && (
          <div className="flex flex-col sm:flex-row gap-3">
            {currentStatus.action.primary && (
              <button
                onClick={currentStatus.action.primary.onClick}
                className={`flex-1 px-4 py-3 bg-gradient-to-r ${currentStatus.gradientFrom} ${currentStatus.gradientTo} text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center font-semibold text-sm`}
              >
                {currentStatus.action.primary.icon}
                {currentStatus.action.primary.text}
              </button>
            )}

            {currentStatus.action.secondary && (
              <button
                onClick={currentStatus.action.secondary.onClick}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all duration-300 flex items-center justify-center font-semibold text-sm"
              >
                {currentStatus.action.secondary.icon}
                {currentStatus.action.secondary.text}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Support Contact */}
      {status === "error" && (
        <div className="mt-6 text-center text-gray-600 text-sm max-w-md bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
          <p className="mb-2">Need immediate assistance?</p>
          <div className="space-y-1">
            <p>
              📧 Email:{" "}
              <a
                href="mailto:support@swiftcare.com"
                className="text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                support@swiftcare.com
              </a>
            </p>
            <p>
              📞 Phone:{" "}
              <a
                href="tel:+977-1-4000000"
                className="text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                +977-1-4000000
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyKhalti;
