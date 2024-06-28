import User from "@/models/User";
import connect from "@/utils/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import OtpSchema from "@/models/Otp";

export const POST = async (request: any) => {
  const { email, otp, password } = await request.json();

  await connect();

  // Check if the user exists
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return new NextResponse("User not found", { status: 404 });
  }

  // Verify OTP
  const storedOtp = await OtpSchema.findOne({ email });

  if (!storedOtp) {
    console.log("Send OTP first");
    return new NextResponse("Send OTP first", { status: 400 });
  }

  // Validate OTP
  //   if (storedOtp.code !== otp || new Date() > storedOtp.expiresAt) {
  //     console.log("Invalid OTP or OTP expired");
  //     return new NextResponse("Invalid OTP or OTP expired", { status: 400 });
  //   }

  // Update OTP status
  storedOtp.expiresAt = new Date(); // Expire OTP immediately after verification
  await storedOtp.save();

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user's password
  try {
    existingUser.password = hashedPassword;
    await existingUser.save();
    return Response.json("Password updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating password:", error);
    return new NextResponse("Failed to update password", { status: 500 });
  }
};
