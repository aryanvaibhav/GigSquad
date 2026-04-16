"use client";

import { useState } from "react";
import axios from "axios";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

type RegisterForm = {
  email: string;
  phone: string;
  password: string;
  type: "student" | "client";
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    email: "",
    phone: "",
    password: "",
    type: "student",
  });

  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEmailError("");
    setPhoneError("");

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.phone || !form.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setEmailError("");
      setPhoneError("");

      const res = await api.post("/auth/register", form);

      localStorage.clear();
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Account created successfully");
      window.location.replace("/dashboard");

    } catch (error) {
      console.error("REGISTER ERROR:", error);

      if (axios.isAxiosError(error)) {
        const data = error.response?.data as {
          field?: string;
          message?: string;
        };

        if (data?.field === "email") {
          setEmailError(data.message || "Email already exists");
        } else if (data?.field === "phone") {
          setPhoneError(data.message || "Phone already exists");
        } else {
          toast.error(data?.message || "Registration failed");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-green-100">

        <h1 className="text-2xl font-semibold text-green-800 mb-6 text-center">
          Create Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-5">

          {/* EMAIL */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 ${
                emailError
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-400"
              }`}
            />
            {emailError && (
              <p className="text-sm text-red-500 mt-1">
                {emailError}
              </p>
            )}
          </div>

          {/* PHONE */}
          <div>
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 ${
                phoneError
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-400"
              }`}
            />
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">
                {phoneError}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          {/* TYPE */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="student">Student</option>
            <option value="client">Client</option>
          </select>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 py-2 text-white font-medium transition duration-200 hover:bg-green-700 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}