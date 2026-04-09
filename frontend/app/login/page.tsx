"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;

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

      if (res.ok) {
        localStorage.setItem("token", data.token);
        const userType = data.user?.type;

        if (userType === "client") {
          router.push("/client-dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4F6F3]">

      {/* LEFT SIDE */}
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

      {/* RIGHT SIDE */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">

        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">

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
          <div className="space-y-5">

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Email</label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-lg 
                  bg-white 
                  border border-gray-400 
                  text-gray-800 
                  placeholder-gray-400
                  shadow-sm
                  focus:outline-none 
                  focus:ring-2 focus:ring-[#7FA37F] 
                  focus:border-[#7FA37F] 
                  transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-11 pl-4 pr-10 rounded-lg 
                  bg-white 
                  border border-gray-400 
                  text-gray-800 
                  placeholder-gray-400
                  shadow-sm
                  focus:outline-none 
                  focus:ring-2 focus:ring-[#7FA37F] 
                  focus:border-[#7FA37F] 
                  transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full h-11 rounded-lg 
            bg-[#7FA37F] 
            hover:bg-[#6E916E] 
            disabled:bg-gray-300 
            text-white 
            font-medium 
            transition"
          >
            {loading ? "Signing in..." : "Continue"}
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