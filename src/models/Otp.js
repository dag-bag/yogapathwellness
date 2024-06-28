import mongoose from "mongoose";

const { Schema } = mongoose;

const OTPSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now() + 10 * 60 * 1000,
  },
});
// Define a TTL index for automatic expiration after 10 minutes
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);
