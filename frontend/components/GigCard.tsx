"use client";

import { Gig } from "@/types";

type GigCardProps = {
  gig: Gig;
  onViewApplicants?: (gigId: string, createdBy?: string) => void;
  onApply?: (gigId: string) => void;
  actionDisabled?: boolean;
  actionLabel?: string;
};

export default function GigCard({
  gig,
  onViewApplicants,
  onApply,
  actionDisabled = false,
  actionLabel,
}: GigCardProps) {
  const handleClick = () => {
    if (!gig?.id) return;

    if (onViewApplicants) {
      onViewApplicants(gig.id, gig.created_by);
    } else if (onApply) {
      onApply(gig.id);
    }
  };

  const totalSlots = gig.slots;
  const filledSlots = gig.filled_slots;

  return (
    <div className="flex items-center justify-between rounded-xl border border-green-100 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-medium text-gray-800">{gig.title}</h2>

        <p className="mt-1 text-sm text-gray-500">{gig.location}</p>

        <p className="mt-1 text-sm font-medium text-gray-700">
          ₹{gig.pay_per_day} / day
        </p>

        {typeof totalSlots === "number" && (
          <p className="mt-1 text-sm text-gray-600">
            Slots:{" "}
            {typeof filledSlots === "number"
              ? `${filledSlots}/${totalSlots}`
              : totalSlots}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={!gig?.id || actionDisabled}
        className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-white transition hover:scale-105 hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:bg-gray-300"
      >
        {actionLabel ?? (onViewApplicants ? "View Applicants" : "Apply")}
      </button>
    </div>
  );
}