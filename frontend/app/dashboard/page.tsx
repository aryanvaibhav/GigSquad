"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import GigCard from "@/components/GigCard";
import { Gig } from "@/types";

export default function DashboardPage() {
  const router = useRouter();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userReady, setUserReady] = useState(false);

  const [applying, setApplying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Load user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    setUserReady(true);
  }, []);

  const role = user?.type || user?.role || user?.user_type;
  const isClient = role === "client";

  // 🔹 Fetch gigs with role-based filtering
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);

        const res = await api.get("/gigs");
        const data = res.data?.gigs || res.data || [];

        // ✅ FILTER FOR CLIENT
        if (isClient) {
          const myGigs = data.filter(
            (gig: any) => gig.created_by === user?.id
          );
          setGigs(myGigs);
        } else {
          // ✅ STUDENT SEES ALL
          setGigs(data);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load gigs");
      } finally {
        setLoading(false);
      }
    };

    if (userReady) {
      fetchGigs();
    }
  }, [userReady, isClient, user?.id]);

  // 🔹 Apply to gig
  const handleApply = async (gigId: string) => {
    try {
      setApplying(gigId);

      await api.post("/applications", {
        gig_id: gigId,
      });

      alert("Applied successfully");

    } catch (err: any) {
      console.error("Apply failed:", err);

      const message =
        err?.response?.data?.message || "Failed to apply";

      alert(message);
    } finally {
      setApplying(null);
    }
  };

  // 🔹 View applicants
  const handleViewApplicants = (gigId: string, createdBy?: string) => {
    if (!gigId) return;

    if (createdBy && createdBy !== user?.id) {
      alert("Not authorized");
      return;
    }

    router.push(`/dashboard/gigs/${gigId}/applicants`);
  };

  // 🔴 Prevent wrong UI before user loads
  if (!userReady) {
    return <div className="p-6">Loading user...</div>;
  }

  // 🔴 Loading state
  if (loading) {
    return <div className="p-6">Loading gigs...</div>;
  }

  // 🔴 Error state
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  // 🔴 Empty state
  if (gigs.length === 0) {
    return <div className="p-6">No gigs available</div>;
  }

  // ✅ MAIN UI
  return (
    <div className="p-6 space-y-4">
      {gigs.map((gig) => (
        <GigCard
          key={gig.id}
          gig={gig}
          onViewApplicants={isClient ? handleViewApplicants : undefined}
          onApply={!isClient ? handleApply : undefined}
          actionDisabled={!isClient ? applying === gig.id : false}
          actionLabel={
            isClient
              ? "View Applicants"
              : applying === gig.id
              ? "Applying..."
              : "Apply"
          }
        />
      ))}
    </div>
  );
}