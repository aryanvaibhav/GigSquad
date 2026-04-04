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
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Find Gigs
        </h1>

        {loading && <div className="text-center">Loading...</div>}

        <div className="grid md:grid-cols-2 gap-4">
          {gigs.map((gig) => {
            const status = getStatus(gig.id);
            const isLoading = applying === gig.id;

            return (
              <div
                key={gig.id}
                className="bg-white p-4 rounded-xl border shadow-sm"
              >
                <h2 className="text-lg font-medium">{gig.title}</h2>

                <p className="text-sm text-gray-500">
                  📍 {gig.location}
                </p>

                <p className="text-sm mt-1">
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