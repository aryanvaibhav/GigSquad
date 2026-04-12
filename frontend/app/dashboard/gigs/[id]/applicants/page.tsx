"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import ApplicantCard from "@/components/ApplicantCard";
import { Applicant, ApplicationStatus } from "@/types";

export default function ApplicantsPage() {
  const params = useParams();
  const gigId = params?.id as string;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsFull, setSlotsFull] = useState(false);

  useEffect(() => {
    console.log("Gig ID:", gigId); // DEBUG

    if (!gigId || gigId === "gig_id") return;

    fetchApplicants();
  }, [gigId]);

  const fetchApplicants = async () => {
    try {
      const res = await api.get(`/applications/${gigId}`);

      const data = res.data || [];
      console.log("Applicants data:", data); // DEBUG

      setApplicants(data);

      const confirmed = data.filter(
        (a: Applicant) => a.status === "confirmed"
      );

      const totalSlots = data[0]?.gig?.slots || 0;

      if (totalSlots && confirmed.length >= totalSlots) {
        setSlotsFull(true);
      }
    } catch (err) {
      console.error("Failed to fetch applicants", err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicant = (
    id: string,
    status: ApplicationStatus
  ) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status } : a
      )
    );
  };

  if (loading) {
    return <p className="p-6">Loading applicants...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Applicants</h1>

      {slotsFull && (
        <p className="text-red-500 font-medium">
          Slots are full — no more accepts allowed
        </p>
      )}

      {applicants.length === 0 ? (
        <p>No applicants yet</p>
      ) : (
        <div className="space-y-3">
          {applicants.map((app) => (
            <ApplicantCard
              key={app.id}
              applicant={app}
              onUpdate={updateApplicant}
              disableActions={slotsFull}
            />
          ))}
        </div>
      )}
    </div>
  );
}