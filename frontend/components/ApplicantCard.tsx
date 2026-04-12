"use client";

import { Applicant, ApplicationStatus } from "@/types";
import api from "@/lib/api";
import { useState } from "react";

export default function ApplicantCard({
  applicant,
  onUpdate,
  disableActions,
}: {
  applicant: Applicant;
  onUpdate: (id: string, status: ApplicationStatus) => void;
  disableActions?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: ApplicationStatus) => {
    try {
      setLoading(true);

      await api.patch(`/applications/${applicant.id}`, {
        status,
      });

      onUpdate(applicant.id, status);
    } catch (err) {
      console.error(err);
      alert("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const disabled =
    disableActions ||
    applicant.status === "confirmed" ||
    applicant.status === "rejected";

  return (
    <div className="border rounded-xl p-4 flex justify-between items-center bg-white shadow-sm">
      <div>
        <p className="font-medium">
          {applicant.student?.name || "Student"}
        </p>
        <p className="text-sm text-gray-500">
          {applicant.student?.email || "No email"}
        </p>
        <p className="text-sm mt-1">
          Status:{" "}
          <span className="capitalize font-semibold">
            {applicant.status}
          </span>
        </p>
      </div>

      <div className="flex gap-2">
        <button
          disabled={disabled || loading}
          onClick={() => handleAction("confirmed")}
          className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Accept
        </button>

        <button
          disabled={disabled || loading}
          onClick={() => handleAction("rejected")}
          className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}