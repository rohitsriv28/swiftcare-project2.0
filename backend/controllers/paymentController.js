import razorpay from "razorpay";
import appointmentModel from "../models/appointmentModel.js";

//Initialize Razorpay
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to make payment
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
    // Create a new order in Razorpay
    const options = {
      amount: appointmentData.amount * 100, // Amount in paise
      //   currency: "INR",
      currency: "NPR",
      receipt: appointmentId,
      notes: {
        appointmentId,
      },
    };
    //Creating the order
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

// API for verifying payment
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    console.log(orderInfo);
    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else{
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

export { payWithRazorpay, verifyRazorpayPayment };
