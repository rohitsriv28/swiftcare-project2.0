import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "0000000000" },
  dob: { type: String, default: "Not Selected" },
  gender: { type: String, default: "Not Selected" },
  address: { type: Object, default: { line1: "", line2: "" } },
  image: {
    type: String,
    default: "https://ui-avatars.com/api/?name=User&background=random",
  },
}, { timestamps: true });

const userModel = mongoose.models.users || mongoose.model("users", userSchema);

export default userModel;
