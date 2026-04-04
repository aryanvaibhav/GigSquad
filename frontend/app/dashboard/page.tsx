"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

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

  // 🔁 Fetch gigs
  const fetchGigs = async () => {
    try {
      const res = await api.get("/gigs");
      setGigs(res?.data?.gigs || []);
    } catch (err) {
      console.error("Gig fetch error:", err);
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
      setApplications([]);
    }
  };

  // 🚀 Apply to gig
  const handleApply = async (gigId: string) => {
    try {
      setApplying(gigId);

      await api.post(`/gigs/${gigId}/apply`);

      // optimistic update
      setApplications((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          status: "applied",
          gig: { id: gigId },
        },
      ]);
    } catch (err) {
      console.error("Apply failed:", err);
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

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Find Gigs
        </h1>

        {loading && (
          <div className="text-center text-gray-600">
            Loading gigs...
          </div>
        )}

        {!loading && gigs.length === 0 && (
          <div className="text-center text-gray-600">
            No gigs found
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {gigs.map((gig) => {
            const status = getStatus(gig.id);
            const isLoading = applying === gig.id;

            return (
              <div
                key={gig.id}
                className="bg-white p-4 rounded-xl border border-green-200 shadow-sm"
              >
                <h2 className="text-lg font-medium text-gray-800">
                  {gig.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  📍 {gig.location}
                </p>

                <p className="text-sm font-medium mt-1 text-gray-700">
                  ₹{gig.pay_per_day}/day
                </p>

                <button
                  disabled={!!status || isLoading}
                  onClick={() => handleApply(gig.id)}
                  className={`mt-3 w-full py-2 rounded-md text-white
                    ${
                      status === "accepted"
                        ? "bg-green-600"
                        : status === "rejected"
                        ? "bg-red-500"
                        : status === "applied"
                        ? "bg-gray-400"
                        : "bg-green-600 hover:bg-green-700"
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