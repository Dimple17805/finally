const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  otp: { type: String },  // Store OTP temporarily
  otpExpires: { type: Date }  // Expiration time for OTP
});

module.exports = mongoose.model("User", userSchema);