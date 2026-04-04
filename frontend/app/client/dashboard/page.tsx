"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

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
    email?: string;
  };
};

export default function ClientDashboard() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  // 🔁 Fetch gigs
  const fetchGigs = async () => {
    const res = await api.get("/gigs");
    setGigs(res?.data?.gigs || []);
  };

  // 🔁 Fetch applicants
  const fetchApplicants = async (gigId: string) => {
    setSelectedGig(gigId);

    const res = await api.get(`/applications/gig/${gigId}`);

    const data = Array.isArray(res?.data)
      ? res.data
      : res?.data?.applications || [];

    setApplicants(data);
  };

  // ✅ Accept
  const handleAccept = async (id: string) => {
    await api.patch(`/applications/${id}/accept`);
    toast.success("Applicant accepted");

    setApplicants((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "accepted" } : a
      )
    );

    fetchGigs();
  };

  // ❌ Reject
  const handleReject = async (id: string) => {
    await api.patch(`/applications/${id}/reject`);
    toast("Applicant rejected");

    setApplicants((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "rejected" } : a
      )
    );
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">
          Client Dashboard
        </h1>

        <div className="grid md:grid-cols-2 gap-4">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className="bg-white p-4 rounded-xl border shadow-sm"
            >
              <h2>{gig.title}</h2>
              <p>{gig.location}</p>
              <p>₹{gig.pay_per_day}</p>

              <p>
                Slots: {gig.filled_slots} / {gig.slots}
              </p>

              <button
                onClick={() => fetchApplicants(gig.id)}
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
              >
                View Applicants
              </button>

              {selectedGig === gig.id &&
                applicants.map((app) => (
                  <div key={app.id} className="mt-2 border-t pt-2">
                    <div className="flex justify-between">
                      <span>{app.student?.email}</span>
                      <span>{app.status}</span>
                    </div>

                    {app.status === "applied" && (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleAccept(app.id)}
                          className="bg-green-600 text-white px-2 py-1 text-xs"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => handleReject(app.id)}
                          className="bg-red-500 text-white px-2 py-1 text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}