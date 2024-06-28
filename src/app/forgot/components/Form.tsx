"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ForgotPasswordFormData {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm<ForgotPasswordFormData>();

  const email = watch("email");
  const otp = watch("otp");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const handleEmailSubmit: SubmitHandler<ForgotPasswordFormData> = async (
    data
  ) => {
    setIsLoading(true);
    try {
      // Simulate API request to send OTP
      const response = await fetch("/api/forgot/sendotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });
      const res = await response.json();
      if (response.status === 200) {
        setStep(2); // Move to OTP verification step if OTP is sent successfully
      } else {
        setError("email", {
          message: res.error ?? "Something went wrong. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("email", {
        message: "Error sending OTP. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit: SubmitHandler<ForgotPasswordFormData> = async (
    data
  ) => {
    setIsLoading(true);
    try {
      // Simulate API request to verify OTP
      const response = await fetch("/api/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email, otp: data.otp }),
      });
      const res = await response.json();
      if (response.status === 200) {
        setStep(3); // Move to password reset step if OTP is verified successfully
      } else {
        clearErrors("otp");
        setError("otp", {
          message: res.error ?? "Invalid OTP. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("otp", {
        message: "Error verifying OTP. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit: SubmitHandler<ForgotPasswordFormData> = async (
    data
  ) => {
    setIsLoading(true);
    try {
      // Simulate API request to reset password
      const response = await fetch("/api/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
      const res = await response.json();
      if (response.status === 200) {
        router.push("/login");
      } else {
        setError("password", {
          message: res.error ?? "Something went wrong. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("password", {
        message: "Error resetting password. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-muted-foreground">
              Enter your email to reset password.
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
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Enter OTP</h1>
            <p className="text-muted-foreground">
              We've sent an OTP to {email}
            </p>
          </div>
          <form onSubmit={handleSubmit(handleOTPSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                {...register("otp", {
                  required: "OTP is required",
                  pattern: {
                    value: /^[0-9]{4}$/,
                    message: "Invalid OTP format",
                  },
                })}
                disabled={isLoading}
              />
              {errors.otp && (
                <p className="text-red-600 text-sm">{errors.otp.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground">
              Enter your new password and confirm
            </p>
          </div>
          <form
            onSubmit={handleSubmit(handlePasswordSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
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
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-600 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: {
                    matchesPreviousPassword: (value) =>
                      value === password || "Passwords do not match",
                  },
                })}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Password Reset Successful</h1>
            <p className="text-muted-foreground">
              Your password has been reset successfully.
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">
              You can now{" "}
              <a href="/login" className="text-blue-500">
                login with your new password.
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
