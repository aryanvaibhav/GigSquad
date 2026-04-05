"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Gig = {
  id: string;
  title: string;
  location: string;
  pay_per_day: number;
};

type Application = {
  id: string;
  status: string;
  gig: {
    id: string;
  };
};

export default function DashboardPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [notified, setNotified] = useState<string[]>([]);

  // 🔁 Fetch gigs
  const fetchGigs = async () => {
    try {
      const res = await api.get("/gigs");
      setGigs(res?.data?.gigs || []);
    } catch (err) {
      console.error(err);
      setGigs([]);
    }
  };

  // 🔁 Fetch applications
  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications/me");

      const data = Array.isArray(res?.data)
        ? res.data
        : res?.data?.applications || [];

      setApplications(data);
    } catch (err) {
      console.error("Application fetch error:", err);
    }
  };

  // 🚀 Apply
  const handleApply = async (gigId: string) => {
    try {
      setApplying(gigId);

      await api.post(`/gigs/${gigId}/apply`);
      toast.success("Applied successfully");

      setApplications((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          status: "applied",
          gig: { id: gigId },
        },
      ]);
    } catch (err) {
      toast.error("Failed to apply");
      console.error(err);
    } finally {
      setApplying(null);
    }
  };

  // helper
  const getStatus = (gigId: string) => {
    return applications.find((a) => a.gig?.id === gigId)?.status;
  };

  // 🔁 Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchGigs();
      await fetchApplications();
      setLoading(false);
    };

    load();
  }, []);

  // 🔁 Polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApplications();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // 🔔 Notifications
  useEffect(() => {
    applications.forEach((app) => {
      if (notified.includes(app.id)) return;

      if (app.status === "accepted") {
        toast.success("🎉 You got selected!");
        setNotified((prev) => [...prev, app.id]);
      }

      if (app.status === "rejected") {
        toast.error("❌ Application rejected");
        setNotified((prev) => [...prev, app.id]);
      }
    });
  }, [applications]);

  return (
    <div className="min-h-screen bg-green-50 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Find Gigs</h1>
          <p className="text-gray-600 text-sm">
            Browse and apply to gigs near you
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-600 mt-10">
            Loading gigs...
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && gigs.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No gigs available right now.
          </div>
        )}

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          {gigs.map((gig) => {
            const status = getStatus(gig.id);
            const isLoading = applying === gig.id;

            return (
              <div
                key={gig.id}
                className="bg-white p-5 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition"
              >
                {/* TITLE */}
                <h2 className="text-lg font-semibold text-gray-900">
                  {gig.title}
                </h2>

                {/* LOCATION */}
                <p className="text-sm text-gray-600 mt-1">
                  📍 {gig.location}
                </p>

                {/* PAY */}
                <p className="text-sm mt-2 font-medium text-gray-800">
                  ₹{gig.pay_per_day}/day
                </p>

                {/* BUTTON */}
                <button
                disabled={!!status || isLoading}
                onClick={() => handleApply(gig.id)}
                className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition
                  ${
                    status === "accepted"
                      ? "bg-green-600 text-white"
                      : status === "rejected"
                      ? "bg-red-500 text-white"
                      : status === "applied"
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                {isLoading
                  ? "Applying..."
                  : status === "accepted"
                  ? "Selected"
                  : status === "rejected"
                  ? "Rejected"
                  : status === "applied"
                  ? "Applied"
                  : "Apply"}
              </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}