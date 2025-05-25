import React, { useContext } from "react";
import {
  CreditCard,
  Wallet,
  Banknote,
  X,
  Loader2,
  CheckCircle,
  Lock,
  Shield,
  Star,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const PaymentModal = ({
  isOpen,
  onClose,
  amount,
  appointmentId,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [paymentCompleted, setPaymentCompleted] = React.useState(false);
  const { backendUrl, token, userData } = useContext(AppContext);

  const paymentMethods = [
    {
      id: "khalti",
      name: "Khalti",
      image: "https://web.khalti.com/static/img/logo1.png", // Replace with your Khalti logo
      description: "Nepal's most trusted digital wallet",
      badge: "Most Popular",
      color: "from-purple-500 to-purple-700",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      id: "razorpay",
      name: "Credit/Debit Card",
      icon: <CreditCard size={28} className="text-blue-600" />,
      description: "Visa, Mastercard & all major cards accepted",
      badge: "Secure",
      color: "from-blue-500 to-blue-700",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  ];

  const handlePayment = async (method) => {
    setIsProcessing(true);
    setSelectedMethod(method);

    try {
      let response;

      if (method === "khalti") {
        response = await axios.post(
          `${backendUrl}/api/user/pay-with-khalti`,
          {
            appointmentId,
            amount,
            user: userData,
          },
          { headers: { token } }
        );

        if (response.data.success && response.data.payment_url) {
          // Store payment session data before redirect
          sessionStorage.setItem(
            "khalti_payment_session",
            JSON.stringify({
              appointmentId,
              pidx: response.data.pidx,
              amount,
              timestamp: Date.now(),
            })
          );

          window.location.href = response.data.payment_url;
          return;
        }
      } else if (method === "razorpay") {
        response = await axios.post(
          `${backendUrl}/api/user/pay-with-razorpay`,
          { appointmentId },
          { headers: { token } }
        );

        if (response.data.success && response.data.order) {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: response.data.order.amount,
            currency: response.data.order.currency,
            name: "SwiftCare's Doctor Appointment",
            description: `Payment for appointment ${appointmentId}`,
            order_id: response.data.order.id,
            handler: async function (response) {
              try {
                const verifyResponse = await axios.post(
                  `${backendUrl}/api/user/verify-razorpay`,
                  {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                  },
                  { headers: { token } }
                );

                if (verifyResponse.data.success) {
                  setPaymentCompleted(true);
                  onPaymentSuccess();
                } else {
                  toast.error("Payment verification failed");
                }
              } catch (error) {
                console.error("Payment verification error:", error);
                toast.error("Failed to verify payment");
              } finally {
                setIsProcessing(false);
              }
            },
            prefill: {
              name: userData?.name || "",
              email: userData?.email || "",
              contact: userData?.phone || "",
            },
            theme: {
              color: "#3399cc",
            },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
                toast.error("Payment cancelled");
              },
            },
          };

          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
          return;
        }
      }

      toast.error("Failed to initialize payment");
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error(error.response?.data?.message || "Payment process failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setIsProcessing(false);
    setPaymentCompleted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 pointer-events-none"></div>

        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">
                {paymentCompleted ? "Payment Successful!" : "Secure Payment"}
              </h3>
              <p className="text-blue-100 mt-1 flex items-center gap-2">
                <Shield size={16} />
                256-bit SSL Encrypted
              </p>
            </div>
            <button
              onClick={() => {
                resetModal();
                onClose();
              }}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="relative p-8">
          {paymentCompleted ? (
            <div className="text-center py-8">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle size={48} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                  <Star size={16} className="text-white" fill="currentColor" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-800 mb-3">
                Payment Completed Successfully!
              </h4>
              <p className="text-gray-600 mb-2">
                Your payment of{" "}
                <span className="font-bold text-2xl text-green-600">
                  रु. {amount}
                </span>{" "}
                has been processed.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Appointment ID: #{appointmentId}
              </p>
              <button
                onClick={() => {
                  resetModal();
                  onClose();
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : isProcessing ? (
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 size={40} className="animate-spin text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">
                Processing{" "}
                {selectedMethod &&
                  paymentMethods.find((m) => m.id === selectedMethod)
                    ?.name}{" "}
                Payment
              </h4>
              <p className="text-gray-600 mb-4">
                Please wait while we securely process your payment...
              </p>
              <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Amount Display */}
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                <div className="text-center">
                  <p className="text-gray-600 text-lg mb-2">Amount to Pay</p>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    रु. {amount}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
                    <Lock size={14} />
                    Appointment ID: #{appointmentId}
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Choose Payment Method
                </h4>
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handlePayment(method.id)}
                    className={`group w-full p-6 border-2 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${method.borderColor} ${method.bgColor} relative overflow-hidden`}
                  >
                    {/* Background Gradient Effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${method.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    ></div>

                    <div className="relative flex items-center gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center">
                        {method.image ? (
                          <img
                            src={method.image}
                            alt={method.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          method.icon
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800 text-lg">
                            {method.name}
                          </span>
                          {method.badge && (
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${method.textColor} ${method.bgColor} border ${method.borderColor}`}
                            >
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {method.description}
                        </p>
                      </div>
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 ${method.borderColor} flex items-center justify-center group-hover:${method.bgColor} transition-colors`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${method.color} bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity`}
                        ></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-gray-800 text-sm mb-1">
                      Your Security is Our Priority
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      All payments are processed through secure, encrypted
                      channels. We never store your payment information on our
                      servers.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
