"use client";
import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Form from "./components/Form";
const Login = () => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/dashboard");
    }
  }, [sessionStatus, router]);
  if (sessionStatus === "loading") {
    return <h1>Loading...</h1>;
  }
  return sessionStatus !== "authenticated" && <Form />;
};

export default Login;
