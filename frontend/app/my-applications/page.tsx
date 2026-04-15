"use client";

import { useEffect, useState } from "react";
import useAuth from "@/lib/useAuth";
import api from "@/lib/api";

type Application = {
  id?: string; // 👈 make optional (important)
  application_id?: string; // 👈 fallback support
  status: "applied" | "confirmed" | "rejected";
  gig: {
    id?: string;
    title?: string;
    location?: string;
    pay_per_day?: number;
  };
};

export default function MyApplicationsPage() {
  const { loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    const fetchApplications = async () => {
      try {
        setLoading(true);

        const res = await api.get("/applications/me");
        const data = res?.data;

        if (Array.isArray(data)) {
          setApplications(data);
        } else if (Array.isArray(data?.applications)) {
          setApplications(data.applications);
        } else {
          setApplications([]);
        }

      } catch (err: any) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [authLoading]);

  // 🔐 Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          My Applications
        </h1>

        {/* LOADING */}
        {loading && (
          <div className="text-gray-600 text-center py-10">
            Loading applications...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="text-red-500 text-center py-10">{error}</div>
        )}

        {/* EMPTY */}
        {!loading && !error && applications.length === 0 && (
          <div className="text-gray-600 text-center py-10">
            No applications yet
          </div>
        )}

        {/* DATA */}
        <div className="space-y-4">
          {!loading &&
            !error &&
            applications.map((app, index) => {
              // 🔥 SAFE UNIQUE KEY
              const key =
                app.id ||
                app.application_id ||
                app.gig?.id ||
                `app-${index}`;

              return (
                <div
                  key={key}
                  className="bg-white rounded-xl shadow-sm p-5 border border-green-100"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800">
                        {app?.gig?.title || "Untitled Gig"}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        📍 {app?.gig?.location || "Unknown location"}
                      </p>

                      <p className="text-sm text-gray-700 mt-1 font-medium">
                        ₹{app?.gig?.pay_per_day ?? 0} / day
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusStyle(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}