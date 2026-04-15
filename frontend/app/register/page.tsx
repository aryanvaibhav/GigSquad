"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

type RegisterForm = {
  email: string;
  phone: string;
  password: string;
  type: "student" | "client";
};

type RegisterResponse = {
  token?: string;
  user?: {
    type?: "student" | "client";
  };
};

type ApiErrorResponse = {
  message?: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    email: "",
    phone: "",
    password: "",
    type: "student",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        name === "type" ? (value as RegisterForm["type"]) : value,
    }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email || !form.phone || !form.password || !form.type) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const payload: RegisterForm = {
        email: form.email,
        password: form.password,
        phone: form.phone,
        type: form.type,
      };

      const res = await api.post<RegisterResponse>("/auth/register", payload);

      if (!res.data.token || !res.data.user) {
        toast.error("Registration failed");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Account created successfully");
      window.location.replace("/dashboard");
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      const message = apiError.response?.data?.message;
      toast.error(message || "Registration failed");
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
            className="w-full cursor-pointer rounded-lg bg-green-600 py-2 text-white transition hover:scale-105 hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
