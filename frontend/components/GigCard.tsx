"use client";

import { useRouter } from "next/navigation";
import { Gig } from "@/types";

export default function GigCard({ gig }: { gig: Gig }) {
  const router = useRouter();

  const handleClick = () => {
    console.log("Navigating to gig:", gig.id); // DEBUG

    if (!gig?.id) {
      alert("Invalid gig ID");
      return;
    }

    router.push(`/dashboard/gigs/${gig.id}/applicants`);
  };

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">{gig.title}</h2>
        <p className="text-sm text-gray-500">{gig.location}</p>
        <p className="text-sm mt-1">
          ₹{gig.pay_per_day}/day • Slots: {gig.filled_slots}/{gig.slots}
        </p>
      </div>

      <button
        onClick={handleClick}
        className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-80"
      >
        View Applicants
      </button>
    </div>
  );
}