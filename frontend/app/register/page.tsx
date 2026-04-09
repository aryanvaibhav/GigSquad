"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    type: "student",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();

    if (!form.email || !form.phone || !form.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", form);
      const data = res.data;

      // ✅ Store token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Account created successfully");

      const userType = data.user?.type;

      // ✅ Role-based redirect
      if (userType === "client") {
        router.push("/client-dashboard");
      } else {
        router.push("/dashboard");
      }

    } catch (err: any) {
      const message = err.response?.data?.message;

      if (message?.includes("already exists")) {
        toast.error("User already exists");
      } else {
        toast.error("Registration failed");
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

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-800"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-800"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-800"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-800"
          >
            <option value="student">Student</option>
            <option value="client">Client</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-white bg-green-600"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}