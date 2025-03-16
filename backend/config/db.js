import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected to the database");
  });
  await mongoose.connect(process.env.MONGO_URI);
};
export default connectDB;
