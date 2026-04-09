"use client";

import { useEffect, useState } from "react";
import useAuth from "@/lib/useAuth";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

type Gig = {
  id: string;
  title: string;
  location: string;
  pay_per_day: number;
  created_by?: string;
};

export default function ClientDashboard() {
  const { loading: authLoading } = useAuth();

  const [gigs, setGigs] = useState<Gig[]>([]);

  const userId =
    typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")?.id
        : null;

  const myGigs = gigs.filter((g) => g.created_by === userId);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    location: "",
    pay_per_day: "",
    total_slots: "",
  });

  const [creating, setCreating] = useState(false);

  // 🔹 Fetch gigs
  useEffect(() => {
    if (authLoading) return;

    const fetchGigs = async () => {
      try {
        setLoading(true);

        const res = await api.get("/gigs");
        const data = res.data;

        if (Array.isArray(data)) {
          setGigs(data);
        } else if (Array.isArray(data?.gigs)) {
          setGigs(data.gigs);
        } else {
          setGigs([]);
        }

      } catch (err) {
        console.error(err);
        toast.error("Failed to load gigs");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [authLoading]);

  // 🔹 Handle input
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Create gig
  const handleCreateGig = async (e: any) => {
    e.preventDefault();

    if (!form.title || !form.location || !form.pay_per_day || !form.total_slots) {
      toast.error("All fields are required");
      return;
    }

    try {
      setCreating(true);

      const res = await api.post("/gigs", {
        title: form.title,
        location: form.location,
        pay_per_day: Number(form.pay_per_day),
        total_slots: Number(form.total_slots),
      });

      toast.success("Gig created successfully");

      // Add new gig to UI
      setGigs((prev) => [res.data, ...prev]);

      // Reset form
      setForm({
        title: "",
        location: "",
        pay_per_day: "",
        total_slots: "",
      });

    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create gig");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Client Dashboard
        </h1>

        {/* 🔥 Create Gig Form */}
        <form
          onSubmit={handleCreateGig}
          className="bg-white p-6 rounded-xl shadow-sm border border-green-100 mb-8 space-y-4"
        >
          <h2 className="text-lg font-medium text-gray-800">
            Create New Gig
          </h2>

          <input
            type="text"
            name="title"
            placeholder="Gig title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-800"
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-800"
          />

          <input
            type="number"
            name="pay_per_day"
            placeholder="Pay per day"
            value={form.pay_per_day}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-800"
          />

          <input
            type="number"
            name="total_slots"
            placeholder="Total slots"
            value={form.total_slots}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-800"
          />

          <button
            type="submit"
            disabled={creating}
            className={`px-4 py-2 rounded-lg text-white ${
              creating
                ? "bg-green-300"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {creating ? "Creating..." : "Create Gig"}
          </button>
        </form>

        {/* 🔥 Gigs List */}
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Your Gigs
          </h2>

          {loading && <p>Loading gigs...</p>}

          {!loading && gigs.length === 0 && (
            <p className="text-gray-500">No gigs created yet</p>
          )}

          <div className="grid gap-4">
            {gigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-green-100"
              >
                <h3 className="text-lg font-medium text-gray-800">
                  {gig.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  📍 {gig.location}
                </p>

                <p className="text-sm text-gray-700 mt-1 font-medium">
                  ₹{gig.pay_per_day} / day
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}