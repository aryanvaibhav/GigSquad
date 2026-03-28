"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // FETCH DATA
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch gigs
        const gigsRes = await fetch("http://localhost:5000/api/v1/gigs");
        const gigsData = await gigsRes.json();

        if (Array.isArray(gigsData)) {
          setGigs(gigsData);
        } else {
          setGigs([]);
        }

        // Fetch applications
        await fetchApplications();

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]); // ✅ FIX: added dependency

  // FETCH APPLICATIONS
  const fetchApplications = async () => {
    try {
      if (!token) return; // ✅ FIX

      const res = await fetch(
        "http://localhost:5000/api/v1/applications/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        setApplications([]);
        return;
      }

      const data = await res.json();

      setApplications(Array.isArray(data) ? data : []); // ✅ FIX (clean)

    } catch (err) {
      console.error(err);
      setApplications([]);
    }
  };

  // APPLY
  const applyToGig = async (gigId: string) => {
    try {
      if (!token) return; // ✅ FIX

      const res = await fetch("http://localhost:5000/api/v1/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gig_id: gigId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      await fetchApplications();

    } catch (err) {
      console.error(err);
    }
  };

  // STATUS
  const getApplicationStatus = (gigId: string) => {
    const app = applications.find((a) => a.gig_id === gigId);
    return app ? app.status : null;
  };

  if (loading) {
    return <p className="p-6 text-gray-600">Loading...</p>; // ✅ FIX (clean render)
  }

  return (
    <div className="min-h-screen bg-[#F4F6F3] p-6">

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Available Gigs
      </h1>

      {gigs.length === 0 && (
        <p className="text-gray-500">No gigs available</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {gigs.map((gig) => {
          const status = getApplicationStatus(gig.id);

          return (
            <div
              key={gig.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {gig.title}
              </h2>

              <p className="text-sm text-gray-600">
                📍 {gig.location}
              </p>

              <p className="text-sm font-medium text-gray-800">
                ₹{gig.pay_per_day} / day
              </p>

              <p className="text-sm text-gray-700">
                Slots: {gig.filled_slots} / {gig.slots}
              </p>

              {status && (
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : status === "applied"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {status}
                </span>
              )}

              <button
                onClick={() => applyToGig(gig.id)}
                disabled={status === "applied" || status === "confirmed"}
                className={`w-full mt-3 h-10 rounded-lg text-sm font-medium transition
                ${
                  status === "confirmed"
                    ? "bg-green-500 text-white"
                    : status === "applied"
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : status === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-[#7FA37F] hover:bg-[#6E916E] text-white"
                }`}
              >
                {status === "confirmed"
                  ? "Selected"
                  : status === "applied"
                  ? "Applied"
                  : status === "rejected"
                  ? "Rejected"
                  : "Apply"}
              </button>
            </div>
          );
        })}

      </div>
    </div>
  );
}