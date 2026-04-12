"use client";

import { Applicant, ApplicationStatus } from "@/types";

type ApplicantCardProps = {
  applicant: Applicant;
  isUpdating?: boolean;
  onStatusChange: (
    id: string,
    status: Extract<ApplicationStatus, "confirmed" | "rejected">
  ) => void | Promise<void>;
};

const getApplicantName = (applicant: Applicant) =>
  applicant.student?.name ??
  applicant.user?.name ??
  applicant.name ??
  "Applicant";

const getApplicantEmail = (applicant: Applicant) =>
  applicant.student?.email ??
  applicant.user?.email ??
  applicant.email ??
  "Email unavailable";

export default function ApplicantCard({
  applicant,
  isUpdating = false,
  onStatusChange,
}: ApplicantCardProps) {
  const isFinalStatus =
    applicant.status === "confirmed" || applicant.status === "rejected";
  const actionsDisabled = isUpdating || isFinalStatus;

  return (
    <div className="flex items-center justify-between rounded-xl border border-green-100 bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium text-gray-900">{getApplicantName(applicant)}</p>
        <p className="text-sm text-gray-500">{getApplicantEmail(applicant)}</p>
        <p className="mt-1 text-sm text-gray-700">
          Status: <span className="font-semibold capitalize">{applicant.status}</span>
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={actionsDisabled}
          onClick={() => onStatusChange(applicant.id, "confirmed")}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isUpdating && applicant.status === "confirmed" ? "Saving..." : "Accept"}
        </button>

        <button
          type="button"
          disabled={actionsDisabled}
          onClick={() => onStatusChange(applicant.id, "rejected")}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isUpdating && applicant.status === "rejected" ? "Saving..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
