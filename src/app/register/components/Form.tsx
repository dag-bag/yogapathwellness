"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

interface FormData {
  email: string;
  otp: string[];
  name: string;
  password: string;
}

export default function Form() {
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
    setError,
  } = useForm<FormData>();

  const email = watch("email");
  const otp = watch("otp");

  const handleEmailSubmit: SubmitHandler<FormData> = async (data) => {
    const response = await fetch("/api/sendMail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const res = await response.json();
    if (!res.error) {
      setStep(2);
    } else {
      setError("email", {
        message: (res.error as string) ?? "Something went wrong",
      });
    }
  };

  const handleOTPSubmit: SubmitHandler<FormData> = async (data) => {
    const isOtpVerified = await fetch("/api/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });
    const res = await isOtpVerified.json();
    if (res.status !== 400) {
      setStep(3);
    } else {
      setError("otp", {
        message: res.error,
      });
    }
  };

  const handleFinalSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Final data:", data);
    // Proceed with the final submission or other actions
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-muted-foreground">
              Enter your email to get started
            </p>
          </div>
          <form
            onSubmit={handleSubmit(handleEmailSubmit)}
            className="space-y-2"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Enter OTP</h1>
            <p className="text-muted-foreground">
              We've sent a one-time password to {email}
            </p>
          </div>
          <form
            onSubmit={handleSubmit(handleOTPSubmit)}
            className="space-y-4 justify-center flex items-center flex-col"
          >
            <InputOTP
              maxLength={4}
              pattern="^[0-9]+$"
              onChange={(e) => setValue("otp", e)}
            >
              <InputOTPGroup>
                {[...Array(4)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {errors.otp && <p className="text-red-600">{errors.otp.message}</p>}
            <Button type="submit" className="w-full">
              Verify
            </Button>
          </form>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Complete Sign Up</h1>
            <p className="text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <form
            onSubmit={handleSubmit(handleFinalSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="John Doe"
                {...register("email", { required: "Name is required" })}
                disabled
              />
              {errors.email && (
                <p className="text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-600">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
