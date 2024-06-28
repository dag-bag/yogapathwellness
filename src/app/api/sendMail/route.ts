import Mailjet from "node-mailjet";
import { NextRequest, NextResponse } from "next/server";
import OtpSchema from "@/models/Otp";
import connect from "@/utils/db";
import User from "@/models/User";

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC!,
  process.env.MJ_APIKEY_PRIVATE!
);

connect();

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function sendOtpEmail(to: string, otp: string) {
  const subject = "OTP Verification";
  const text = `Your OTP for login to https://yogpathwellness.com is ${otp}`;
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_USERNAME!,
          Name: "YOGA PATH",
        },
        To: [
          {
            Email: to,
            Name: "Yoga Path User",
          },
        ],
        Subject: subject,
        TextPart: text,
      },
    ],
  });

  return request
    .then(() => {
      console.log("Email sent successfully");
    })
    .catch((err) => {
      console.error("Error sending email:", err);
      throw new Error("Email not sent");
    });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const existingOtp = await OtpSchema.findOne({ email });
    const otp = generateOTP();

    if (existingOtp) {
      existingOtp.otp = otp;
      await existingOtp.save();
    } else {
      const otpDocument = new OtpSchema({ email, otp });
      await otpDocument.save();
    }

    await sendOtpEmail(email, otp);

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error sending OTP" }, { status: 500 });
  }
}
