"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedGigs, setAppliedGigs] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:5000/api/v1/gigs")
      .then((res) => res.json())
      .then((data) => {
        setGigs(data);
        setLoading(false);
      });
  }, []);

  const applyToGig = async (gigId: string) => {
  if (appliedGigs.includes(gigId)) return;

  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/v1/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ gig_id: gigId }),
  });

  const data = await res.json();

  if (res.ok) {
    setAppliedGigs((prev) => [...prev, gigId]); // 🔥 update UI
  } else {
    alert(data.message);
  }
};
  return (
    <div className="min-h-screen bg-[#F4F6F3] p-6">

      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Available Gigs
      </h1>

      {loading && <p className="text-gray-600">Loading...</p>}

      {!loading && gigs.length === 0 && (
        <p className="text-gray-500">No gigs available</p>
      )}

      {/* GIG GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {gigs.map((gig) => (
          <div
            key={gig.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3"
          >
            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900">
              {gig.title}
            </h2>

            {/* Location */}
            <p className="text-sm text-gray-600">
              📍 {gig.location}
            </p>

            {/* Pay */}
            <p className="text-sm font-medium text-gray-800">
              ₹{gig.pay_per_day} / day
            </p>

            {/* Slots */}
            <p className="text-sm text-gray-700">
              Slots: {gig.filled_slots} / {gig.slots}
            </p>

            {/* Button */}
            <button
            onClick={() => applyToGig(gig.id)}
            disabled={appliedGigs.includes(gig.id)}
            className={`w-full mt-3 h-10 rounded-lg text-sm font-medium transition
            ${
                appliedGigs.includes(gig.id)
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#7FA37F] hover:bg-[#6E916E] text-white"
            }`}
            >
            {appliedGigs.includes(gig.id) ? "Applied" : "Apply"}
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}