import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointments",
      required: true,
    },
    khaltiPaymentId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


const transactionModel = mongoose.models.transactions || mongoose.model("transactions", transactionSchema);

export default transactionModel;