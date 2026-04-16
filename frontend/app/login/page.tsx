"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      // 🔥 reset session
      localStorage.clear();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.replace("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4F6F3]">

      {/* LEFT */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-[#E6EDE4] p-10">
        <div className="text-center space-y-5 max-w-sm">
          <img
            src="https://illustrations.popsy.co/gray/work-from-home.svg"
            alt="illustration"
            className="w-full max-w-xs mx-auto"
          />
          <h2 className="text-xl font-semibold text-gray-900">
            Work. Earn. Grow.
          </h2>
          <p className="text-sm text-gray-600">
            Find gigs, build experience, and earn flexibly with GigSquad.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to continue
            </p>
          </div>

          <div className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-11 pl-4 pr-10 rounded-lg border border-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full rounded-lg bg-green-600 h-11 text-white font-medium transition duration-200 hover:bg-green-700 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}