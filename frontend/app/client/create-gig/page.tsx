"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CreateGigPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    location: "",
    pay_per_day: "",
    slots: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.location.trim()) return "Location is required";
    if (!form.pay_per_day || Number(form.pay_per_day) <= 0)
      return "Valid pay is required";
    if (!form.slots || Number(form.slots) <= 0)
      return "Valid slots required";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/gigs", {
        title: form.title,
        location: form.location,
        pay_per_day: Number(form.pay_per_day),
        slots: Number(form.slots),
      });

      // Redirect to dashboard after creation
      router.push("/client/dashboard");
    } catch (err: any) {
      console.error("Create gig failed:", err);
      setError("Failed to create gig");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border border-green-100 p-6">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Create New Gig
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm text-gray-600">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Campus Promotion"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm text-gray-600">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. IIT BHU"
            />
          </div>

          {/* Pay */}
          <div>
            <label className="text-sm text-gray-600">Pay per day (₹)</label>
            <input
              type="number"
              name="pay_per_day"
              value={form.pay_per_day}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Slots */}
          <div>
            <label className="text-sm text-gray-600">Number of Slots</label>
            <input
              type="number"
              name="slots"
              value={form.slots}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            {loading ? "Creating..." : "Create Gig"}
          </button>
        </form>
      </div>
    </div>
  );
}