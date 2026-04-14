"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { isValidUuid } from "@/lib/uuid";

type Gig = {
  id: string;
  title: string;
  location: string;
  pay_per_day: number;
};

type Application = {
  id: string;
  status: "applied" | "confirmed" | "rejected";
  student: {
    id: string;
    name?: string;
    email?: string;
  };
};

export default function ClientDashboard() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);

  // Fetch gigs
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        const res = await api.get("/gigs");

        const data = res?.data;

        if (Array.isArray(data)) {
          setGigs(data);
        } else if (Array.isArray(data?.gigs)) {
          setGigs(data.gigs);
        } else {
          setGigs([]);
        }
      } catch (err) {
        console.error("Error fetching gigs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  // Fetch applications for selected gig
  const fetchApplications = async (gigId: string) => {
    if (!isValidUuid(gigId)) {
      setApplications([]);
      setSelectedGig(null);
      return;
    }

    try {
      setSelectedGig(gigId);
      setAppLoading(true);

      const res = await api.get(`/gigs/${gigId}/applications`);
      const data = res?.data;

      if (Array.isArray(data)) {
        setApplications(data);
      } else if (Array.isArray(data?.applications)) {
        setApplications(data.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setApplications([]);
    } finally {
      setAppLoading(false);
    }
  };

  // Accept / Reject handler
  const handleAction = async (
    appId: string,
    action: "confirmed" | "rejected"
  ) => {
    try {
      await api.patch(`/applications/${appId}`, {
        status: action,
      });

      // Refresh applications
      if (selectedGig) {
        fetchApplications(selectedGig);
      }
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Client Dashboard
        </h1>

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-600 py-10">
            Loading gigs...
          </div>
        )}

        {/* Gigs */}
        <div className="grid md:grid-cols-2 gap-4">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              onClick={() => fetchApplications(gig.id)}
              className={`cursor-pointer bg-white border rounded-xl p-4 shadow-sm hover:border-green-300 ${
                selectedGig === gig.id ? "border-green-500" : "border-green-100"
              }`}
            >
              <h2 className="font-medium text-gray-800">{gig.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                📍 {gig.location}
              </p>
              <p className="text-sm font-medium mt-1">
                ₹{gig.pay_per_day}/day
              </p>
            </div>
          ))}
        </div>

        {/* Applications Section */}
        {selectedGig && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Applicants
            </h2>

            {appLoading ? (
              <div className="text-gray-600">Loading applicants...</div>
            ) : applications.length === 0 ? (
              <div className="text-gray-600">No applicants yet</div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {app?.student?.name || "Student"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {app?.student?.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status */}
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${getStatusStyle(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>

                      {/* Actions */}
                      {app.status === "applied" && (
                        <>
                          <button
                            onClick={() =>
                              handleAction(app.id, "confirmed")
                            }
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              handleAction(app.id, "rejected")
                            }
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
