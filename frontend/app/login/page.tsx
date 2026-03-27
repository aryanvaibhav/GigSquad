"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4F6F3]">

      {/* LEFT SIDE (ILLUSTRATION) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-[#E8EFE6] p-10">
        <div className="text-center space-y-4 max-w-sm">
          
          {/* Replace with your own image later */}
          <img
            src="https://illustrations.popsy.co/gray/work-from-home.svg"
            alt="illustration"
            className="w-full max-w-xs mx-auto"
          />

          <h2 className="text-xl font-semibold text-gray-800">
            Work. Earn. Grow.
          </h2>

          <p className="text-sm text-gray-600">
            Find gigs, build experience, and earn flexibly with GigSquad.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (LOGIN CARD) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to continue
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-4">

            <div className="space-y-1">
              <label className="text-sm text-gray-700">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#7FA37F] focus:border-[#7FA37F]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#7FA37F] focus:border-[#7FA37F]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            className="w-full h-11 rounded-lg bg-[#7FA37F] hover:bg-[#6E916E] text-white font-medium transition"
          >
            Continue
          </button>

          {/* Footer */}
          <p className="text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <span className="text-[#7FA37F] hover:underline cursor-pointer">
              Sign up
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}