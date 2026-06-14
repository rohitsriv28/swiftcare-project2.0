import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    docId: { type: String, required: true, index: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    payment: { type: Boolean, required: true },
    isCancelled: { type: Boolean, required: true },
    isComplete: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ userId: 1, createdAt: -1 });
appointmentSchema.index({ docId: 1, slotDate: 1 });

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
