import connect from "@/utils/db";
import OtpSchema from "@/models/Otp";
export const POST = async (request: any) => {
  let { otp, email } = await request.json();
  otp = parseInt(otp);
  await connect();
  try {
    await connect(); // Czonnect to MongoDB
    const savedOtp = await OtpSchema.findOne({ email });
    if (!savedOtp) {
      return Response.json({ error: "OTP not found or expired", status: 400 });
    }
    if (savedOtp.otp !== otp) {
      return Response.json({ error: "Invalid OTP", status: 400 });
    }
    return Response.json({ message: "OTP verified successfully", status: 200 });
  } catch (error) {
    return Response.error();
  }
};
