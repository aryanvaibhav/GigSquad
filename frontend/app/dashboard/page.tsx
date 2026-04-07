"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

type Gig = {
  id: string;
  title: string;
  location: string;
  pay_per_day: number;
};

type Application = {
  id: string;
  status: string;
  gig_id?: string;
  gig?: {
    id: string;
  };
};

export default function DashboardPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  // 🔹 Fetch gigs + applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [gigRes, appRes] = await Promise.all([
          api.get("/gigs"),
          api.get("/applications/me"),
        ]);

        setGigs(gigRes.data || []);
        setApplications(appRes.data || []);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Check if already applied
  const hasApplied = (gigId: string) => {
    return applications.some(
      (app) =>
        app.gig_id === gigId ||
        app.gig?.id === gigId
    );
  };

  // 🔹 Apply handler (FIXED)
  const handleApply = async (gigId: string) => {
    try {
      setApplying(gigId);

      await api.post(`/applications`, {
        gig_id: gigId,
      });

      toast.success("Applied successfully");

      // 🔥 Update UI instantly
      setApplications((prev) => [
        ...prev,
        {
          id: Math.random().toString(), // temp id
          status: "applied",
          gig_id: gigId,
        },
      ]);

    } catch (err: any) {
      const message = err.response?.data?.message;

      if (message === "Already applied") {
        toast.error("You have already applied to this gig");
      } else if (message === "Gig is full") {
        toast.error("No slots available");
      } else if (message === "Student profile not found") {
        toast.error("Please complete your profile first");
      } else {
        toast.error("Something went wrong");
      }

      console.log("ERROR:", message);

    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Available Gigs
        </h1>

        <div className="grid gap-4">
          {gigs.map((gig) => {
            const applied = hasApplied(gig.id);
            const isApplying = applying === gig.id;

            return (
              <div
                key={gig.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-green-100 flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-medium text-gray-800">
                    {gig.title}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    📍 {gig.location}
                  </p>

                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    ₹{gig.pay_per_day} / day
                  </p>
                </div>

                {/* 🔥 Apply Button */}
                <button
                  onClick={() => handleApply(gig.id)}
                  disabled={applied || isApplying}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    applied
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : isApplying
                      ? "bg-green-300 text-white"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {applied
                    ? "Applied"
                    : isApplying
                    ? "Applying..."
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