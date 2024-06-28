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
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface FormData {
  email: string;
  otp: string;
  password: string;
}

export default function Form() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
    resetField,
    setError,
  } = useForm<FormData>();

  const email = watch("email");
  const otp = watch("otp");

  const handleEmailSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
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
        setError("email", { message: res.error ?? "Something went wrong" });
      }
    } catch (error) {
      setError("email", { message: "Error sending email" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });
      const res = await response.json();
      if (res.status !== 400) {
        setStep(3);
      } else {
        setError("otp", {
          message: res.error,
          type: "disabled",
        });
        resetField("otp");
      }
    } catch (error) {
      setError("otp", { message: "Error verifying OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: data.password,
        }),
      });
      if (response.status === 400) {
        setError("email", { message: "This email is already registered" });
      }
      if (response.status === 200) {
        signIn("credentials", {
          redirect: false,
          email,
          password: data.password,
        });
      }
    } catch (error) {
      setError("password", { message: "Error during registration" });
    } finally {
      setIsLoading(false);
    }
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
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Continue"}
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
            {errors.otp && (
              <p className="text-red-600 text-sm">{errors.otp.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
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
                type="email"
                placeholder="m@example.com"
                {...register("email", { required: "Email is required" })}
                disabled
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
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
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-600 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
