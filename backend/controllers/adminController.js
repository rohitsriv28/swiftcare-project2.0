import validator from "validator";

//API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      experience,
      degree,
      about,
      fee,
      address,
    } = req.body;
    const imageFile = req.file;

    // verifying all required fields
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !experience ||
      !degree ||
      !about ||
      !fee ||
      !address ||
      !imageFile
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // password validation
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be atleast 6 characters",
        });
    }
  } catch (error) {}
};

export { addDoctor };
