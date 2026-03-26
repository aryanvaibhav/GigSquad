"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const data = await apiRequest("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } else {
      alert(data.error);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-6 border rounded-lg w-80 space-y-4">
        <h1 className="text-xl font-semibold">Login</h1>

        <input
          placeholder="Email"
          className="w-full border p-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}