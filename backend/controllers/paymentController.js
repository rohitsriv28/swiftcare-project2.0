import axios from "axios";
import razorpay from "razorpay";
import appointmentModel from "../models/appointmentModel.js";
import transactionModel from "../models/transactionModel.js";

// API for Khalti payment
const initiateKhaltiPayment = async (req, res) => {
  const { appointmentId, amount, user } = req.body;

  // Validate minimum amount (10 NPR = 1000 paisa)
  if (amount < 10) {
    return res.status(400).json({
      success: false,
      message: "Amount must be at least 10 NPR",
    });
  }

  try {
    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: `${process.env.FRONTEND_URL}/verify-khalti?appointmentId=${appointmentId}`,
        website_url: process.env.FRONTEND_URL,
        amount: Math.round(amount * 100), // Convert to paisa
        purchase_order_id: appointmentId,
        purchase_order_name: "Appointment Booking",
        customer_info: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const transaction = new transactionModel({
      appointmentId,
      khaltiPaymentId: response.data.pidx,
    });

    await transaction.save();

    res.json({
      success: true,
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
    });
  } catch (error) {
    console.error("Khalti Init Error:", error.response?.data || error.message);
    let errorMessage = "Payment initiation failed";

    if (error.response?.data?.error_key === "validation_error") {
      errorMessage = error.response.data.detail || "Validation error";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.response?.data,
    });
  }
};

const verifyKhaltiPayment = async (req, res) => {
  const { pidx, appointmentId } = req.body;

  // Validate required fields
  if (!pidx || !appointmentId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: pidx and appointmentId",
    });
  }

  try {
    // First verify with Khalti
    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { status, transaction_id, total_amount } = response.data;

    const transaction = await transactionModel.findOne({
      khaltiPaymentId: pidx,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Something went wrong.",
      });
    }

    const purchase_order_id = transaction.appointmentId;

    // Get appointment data to include amount in response
    const appointmentData = await appointmentModel.findById(appointmentId);

    // Debug logging
    console.log("Verification Request:", {
      pidx: req.body.pidx,
      appointmentId: req.body.appointmentId,
      timestamp: new Date().toISOString(),
    });
    console.log("Verifying payment:", {
      khaltiPurchaseOrderId: purchase_order_id,
      ourAppointmentId: appointmentId,
      status: status,
    });

    // Convert both IDs to string for comparison
    if (purchase_order_id.toString() !== appointmentId.toString()) {
      return res.status(400).json({
        success: false,
        message: `Appointment ID mismatch. Expected: ${appointmentId}, Received: ${purchase_order_id}`,
        details: {
          khaltiPurchaseOrderId: purchase_order_id,
          ourAppointmentId: appointmentId,
        },
      });
    }

    // Handle different statuses
    switch (status) {
      case "Completed":
        await appointmentModel.findByIdAndUpdate(appointmentId, {
          payment: true,
          paymentMethod: "Khalti",
          paymentDate: new Date(),
        });
        return res.json({
          success: true,
          message: "Payment verified successfully",
          data: {
            ...response.data,
            // Include appointment amount if total_amount is not available from Khalti
            amount: total_amount || appointmentData?.amount * 100, // Convert to paisa if needed
            appointmentId: appointmentId,
            pidx: pidx,
          },
        });

      case "Pending":
        return res.status(202).json({
          success: false,
          message: "Payment is pending. Please check again later.",
        });

      case "Expired":
      case "User canceled":
        return res.status(400).json({
          success: false,
          message: `Payment was ${status.toLowerCase()}`,
        });

      default:
        return res.status(400).json({
          success: false,
          message: `Payment status: ${status}`,
        });
    }
  } catch (error) {
    console.error(
      "Khalti Verify Error:",
      error.response?.data || error.message
    );

    let errorMessage = "Payment verification failed";
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.response?.data,
    });
  }
};

// Razorpay initialization and methods remain the same
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const payWithRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.isCancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment not found or already cancelled",
      });
    }

    const options = {
      amount: appointmentData.amount * 100,
      currency: "NPR",
      receipt: appointmentId,
      notes: {
        appointmentId,
      },
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
        paymentMethod: "Razorpay",
        paymentDate: new Date(),
      });
      res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not verified/ Payment failed",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  payWithRazorpay,
  verifyRazorpayPayment,
};
