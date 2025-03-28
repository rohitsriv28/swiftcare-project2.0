import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    experience: { type: String, required: true },
    degree: { type: String, required: true },
    about: { type: String, required: true },
    fee: { type: Number, required: true },
    availability: { type: Boolean, default: true},
    address: { type: Object, required: true },
    date: { type: Date, required: true, default:new Date() },
    slots_booked: { type: Object, default: {} },
  },
  { minimize: false }
);

const doctorModel =
  mongoose.models.doctors || mongoose.model("doctors", doctorSchema);

export default doctorModel;
