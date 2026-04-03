"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Gig = {
  id: string;
  title: string;
  location: string;
  pay_per_day: number;
  slots: number;
  filled_slots: number;
};

type Applicant = {
  id: string;
  status: string;
  student?: {
    id: string;
    email?: string;
  };
};

export default function ClientDashboard() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGig, setSelectedGig] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // 🔁 Fetch gigs
  const fetchGigs = async () => {
    try {
      setLoading(true);

      const res = await api.get("/gigs");
      const data = res?.data?.gigs || [];

      setGigs(data);
    } catch (err) {
      console.error("Error fetching gigs:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Fetch applicants
  const fetchApplicants = async (gigId: string) => {
    try {
      setLoadingApplicants(true);
      setSelectedGig(gigId);

      const res = await api.get(`/applications/gig/${gigId}`);

      const data = Array.isArray(res?.data)
        ? res.data
        : res?.data?.applications || [];

      setApplicants(data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // ✅ Accept applicant
  const handleAccept = async (appId: string) => {
    try {
      await api.patch(`/applications/${appId}/accept`);

      // update applicant status
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: "accepted" } : app
        )
      );

      // update slot count
      setGigs((prev) =>
        prev.map((gig) =>
          gig.id === selectedGig
            ? { ...gig, filled_slots: gig.filled_slots + 1 }
            : gig
        )
      );
    } catch (err) {
      console.error("Accept failed:", err);
    }
  };

  // ❌ Reject applicant
  const handleReject = async (appId: string) => {
    try {
      await api.patch(`/applications/${appId}/reject`);

      setApplicants((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: "rejected" } : app
        )
      );
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Client Dashboard
        </h1>

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-600">
            Loading gigs...
          </div>
        )}

        {/* Empty */}
        {!loading && gigs.length === 0 && (
          <div className="text-center text-gray-600">
            No gigs created yet
          </div>
        )}

        {/* Gigs */}
        <div className="grid md:grid-cols-2 gap-4">
          {gigs.map((gig) => (
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

              <p className="text-sm mt-1 text-gray-700">
                ₹{gig.pay_per_day}/day
              </p>

              {/* Slots */}
              <p className="text-sm mt-2 font-medium text-green-700">
                Slots: {gig.filled_slots} / {gig.slots}
              </p>

              {/* View Applicants */}
              <button
                onClick={() => fetchApplicants(gig.id)}
                className="mt-3 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                View Applicants
              </button>

              {/* Applicants Section */}
              {selectedGig === gig.id && (
                <div className="mt-4 border-t pt-3">
                  <h3 className="text-sm font-semibold mb-2">
                    Applicants
                  </h3>

                  {loadingApplicants && (
                    <p className="text-sm text-gray-500">Loading...</p>
                  )}

                  {!loadingApplicants && applicants.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No applicants yet
                    </p>
                  )}

                  {!loadingApplicants &&
                    applicants.map((app) => (
                      <div
                        key={app.id}
                        className="flex flex-col gap-2 border-b py-2 text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span>
                            {app.student?.email || "Student"}
                          </span>

                          <span
                            className={`px-2 py-1 rounded text-xs
                              ${
                                app.status === "accepted"
                                  ? "bg-green-100 text-green-700"
                                  : app.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        {app.status === "applied" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(app.id)}
                              className="flex-1 bg-green-600 text-white py-1 rounded-md text-xs hover:bg-green-700"
                            >
                              Accept
                            </button>

                            <button
                              onClick={() => handleReject(app.id)}
                              className="flex-1 bg-red-500 text-white py-1 rounded-md text-xs hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}