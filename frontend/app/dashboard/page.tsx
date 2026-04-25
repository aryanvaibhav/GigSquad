"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import GigCard from "@/components/GigCard";
import { Application, Gig, UserType } from "@/types";

type StoredUser = {
  id?: string;
  type?: UserType;
};

type ApiErrorResponse = {
  message?: string;
};

const isGigArray = (value: unknown): value is Gig[] => Array.isArray(value);

export default function DashboardPage() {
  const router = useRouter();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  // ✅ FIXED SESSION HANDLING
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!userData || !token) {
        router.replace("/login"); // 🔥 replace instead of push
        return;
      }

      const parsedUser = JSON.parse(userData);

      if (!parsedUser?.id || !parsedUser?.type) {
        localStorage.clear();
        router.replace("/login");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.clear();
      router.replace("/login");
    }
  }, [router]);

  const isClient = user?.type === "client";

  const visibleGigs = isClient
    ? gigs.filter((gig) => gig.created_by === user?.id)
    : gigs;

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const gigsResponse = await api.get("/gigs");
        const gigsData: unknown = gigsResponse.data;

        if (isGigArray(gigsData)) {
          setGigs(gigsData);
        } else if (
          typeof gigsData === "object" &&
          gigsData !== null &&
          "gigs" in gigsData &&
          isGigArray(gigsData.gigs)
        ) {
          setGigs(gigsData.gigs);
        } else {
          setGigs([]);
        }

        if (!isClient) {
          const applicationsResponse = await api.get("/applications/me");
          const applicationsData: unknown = applicationsResponse.data;

          if (Array.isArray(applicationsData)) {
            setApplications(applicationsData as Application[]);
          } else if (
            typeof applicationsData === "object" &&
            applicationsData !== null &&
            "applications" in applicationsData &&
            Array.isArray(applicationsData.applications)
          ) {
            setApplications(applicationsData.applications as Application[]);
          } else {
            setApplications([]);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isClient]);

  const hasApplied = (gigId: string) =>
    applications.some(
      (application) =>
        application.gig_id === gigId || application.gig?.id === gigId
    );

  const handleApply = async (gigId: string) => {
    if (!gigId) return;

    try {
      setApplying(gigId);

      await api.post("/applications", { gig_id: gigId });

      setApplications((currentApplications) => [
        ...currentApplications,
        {
          id: `temp-${gigId}`,
          status: "applied",
          gig_id: gigId,
        },
      ]);

      toast.success("Applied successfully");
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      toast.error(apiError.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  // ❌ REMOVED sessionStorage logic (IMPORTANT)
  const handleViewApplicants = (gigId: string, createdBy?: string) => {
    if (!gigId || !user?.id) return;
    if (!createdBy || createdBy !== user.id) return;

    router.push(`/dashboard/gigs/${gigId}/applicants`);
  };

  if (!user) return <div className="p-6">Loading user...</div>;
  if (loading) return <div className="p-6">Loading gigs...</div>;

  return (
    <div className="p-6 space-y-4">
      {visibleGigs.map((gig) => (
        <GigCard
          key={gig.id}
          gig={gig}
          onViewApplicants={isClient ? handleViewApplicants : undefined}
          onApply={!isClient ? handleApply : undefined}
          actionDisabled={!isClient ? hasApplied(gig.id) || applying === gig.id : false}
          actionLabel={
            isClient
              ? "View Applicants"
              : hasApplied(gig.id)
              ? "Applied"
              : applying === gig.id
              ? "Applying..."
              : "Apply"
          }
        />
      ))}
    </div>
  );
}