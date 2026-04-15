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
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  // 🔥 LOAD USER SAFELY
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!userData || !token) {
        router.push("/login");
        return;
      }

      setUser(JSON.parse(userData));
    } catch {
      router.push("/login");
    }
  }, [router]);

  const isClient = user?.type === "client";

  // 🔹 FETCH GIGS
  useEffect(() => {
    if (!user) return;

    const fetchGigs = async () => {
      try {
        const res = await api.get("/gigs");
        const data = res.data?.gigs || res.data || [];

        if (isClient) {
          setGigs(data.filter((g: any) => g.created_by === user.id));
        } else {
          setGigs(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [user, isClient]);

  const handleApply = async (gigId: string) => {
    try {
      setApplying(gigId);

      await api.post("/applications", { gig_id: gigId });

      alert("Applied successfully");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  const handleViewApplicants = (gigId: string) => {
    router.push(`/dashboard/gigs/${gigId}/applicants`);
  };

  if (!user) return <div className="p-6">Loading user...</div>;
  if (loading) return <div className="p-6">Loading gigs...</div>;

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