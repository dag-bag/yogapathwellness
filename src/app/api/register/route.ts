import User from "@/models/User";
import connect from "@/utils/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import OtpSchema from "@/models/Otp";
export const POST = async (request: any) => {
  const { email, password } = await request.json();

  await connect();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return new NextResponse("Email is already in use", { status: 400 });
  }
  const Otp = await OtpSchema.findOne({ email });
  if (!Otp) {
    console.log("Send otp first");
    return Response.json(
      { message: "Send otp first", error: true },
      { status: 400 }
    );
  }

  console.log("Otp verified");
  Otp.expiresAt = new Date();
  await Otp.save();
  console.log("Otp deleted");
  const hashedPassword = await bcrypt.hash(password, 5);
  const newUser = new User({
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    return new NextResponse("user is registered", { status: 200 });
  } catch (err: any) {
    return new NextResponse(err, {
      status: 500,
    });
  }
};
