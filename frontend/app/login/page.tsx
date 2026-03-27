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
    <div className="min-h-screen flex items-center justify-center bg-[#F6F7F5] px-6">

      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#A3B18A] focus:border-[#A3B18A] transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#A3B18A] focus:border-[#A3B18A] transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full h-11 rounded-lg bg-[#181818] hover:bg-[#000000] text-white font-medium transition"
        >
          Continue
        </button>

        {/* Footer */}
        <p className="text-sm text-center text-gray-500">
          Don’t have an account?{" "}
          <span className="text-gray-700 hover:underline cursor-pointer">
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}