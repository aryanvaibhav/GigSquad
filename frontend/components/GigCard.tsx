"use client";

import { useRouter } from "next/navigation";
import { Gig } from "@/types";

type GigCardProps = {
  gig: Gig;
  onViewApplicants?: (gigId: string) => void;
};

export default function GigCard({
  gig,
  onViewApplicants,
}: GigCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!gig?.id) {
      return;
    }

    if (onViewApplicants) {
      onViewApplicants(gig.id);
      return;
    }

    router.push(`/dashboard/gigs/${gig.id}/applicants`);
  };

  const totalSlots = gig.slots ?? gig.total_slots;
  const filledSlots = gig.filled_slots;

  return (
    <div className="flex items-center justify-between rounded-xl border border-green-100 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-medium text-gray-800">{gig.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{gig.location}</p>
        <p className="mt-1 text-sm font-medium text-gray-700">
          Rs.{gig.pay_per_day} / day
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
        disabled={!gig?.id}
        className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        View Applicants
      </button>
    </div>
  );
}
