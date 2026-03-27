"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function Dashboard() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Fetch gigs
    fetch("http://localhost:5000/api/v1/gigs")
      .then((res) => res.json())
      .then((data) => {
        setGigs(data);
        setLoading(false);
      });
  }, []);

  // 🔥 APPLY FUNCTION
  const applyToGig = async (gigId: string) => {
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
      alert("Applied successfully");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Available Gigs</h1>

      {loading && <p>Loading...</p>}

      {!loading && gigs.length === 0 && (
        <p className="text-gray-500">No gigs available</p>
      )}

      {/* GIG LIST */}
      <div className="grid gap-4">
        {gigs.map((gig) => (
          <div
            key={gig.id}
            className="p-4 border border-gray-200 rounded-xl bg-white"
          >
            <h2 className="font-semibold text-lg">{gig.title}</h2>
            <p className="text-sm text-gray-500">{gig.location}</p>
            <p className="text-sm text-gray-600">
              ₹{gig.pay_per_day} / day
            </p>

            <button
              onClick={() => applyToGig(gig.id)}
              className="mt-3 px-4 py-2 rounded-lg bg-[#A3B18A] text-white hover:bg-[#8FA77A]"
            >
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}