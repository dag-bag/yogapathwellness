import Mailjet from "node-mailjet";
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC!,
  process.env.MJ_APIKEY_PRIVATE!,
  {
    config: {},
    options: {},
  }
);
import { NextRequest } from "next/server";
import OtpSchema from "@/models/Otp";
import connect from "@/utils/db";
connect();
function generateOTP() {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
}
export async function POST(NextRequest: NextRequest) {
  const { email } = await NextRequest.json();
  if (!email) {
    return Response.json({ email: "invalid body" });
  }
  console.log(NextRequest);
  const to = email;
  try {
    const otp = generateOTP();
    const otpDocument = new OtpSchema({
      email: to,
      otp,
    });
    await otpDocument.save();
    console.log("OTP saved successfully");
    const subject = "OTP Verification";
    const text = `Your OTP for login https://yogpathwellness.com is ${otp}`;
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_USERNAME,
            Name: "YOGA PATH",
          },
          To: [
            {
              Email: to,
              Name: "yoga path user",
            },
          ],
          Subject: subject,
          TextPart: text,
        },
      ],
    });

    request
      .then((result) => {
        console.log("email send successfully");
      })
      .catch((err) => {
        throw new Error("Email Not send");
      });
    return Response.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Error sending email" });
  }
}
