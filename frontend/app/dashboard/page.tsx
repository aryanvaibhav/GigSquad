"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import useAuth from "@/lib/useAuth";
import api from "@/lib/api";
import GigCard from "@/components/GigCard";
import { Application, Gig, UserType } from "@/types";
import { toast } from "react-hot-toast";

type StoredUser = {
  type?: UserType;
};

type ApiErrorResponse = {
  message?: string;
};

const isGigArray = (value: unknown): value is Gig[] => Array.isArray(value);

const getStoredUserType = (): UserType | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    const parsedUser = JSON.parse(storedUser) as StoredUser;

    return parsedUser.type ?? null;
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return null;
  }
};

export default function DashboardPage() {
  const { loading: authLoading } = useAuth();
  const router = useRouter();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const userType = getStoredUserType();
  const isClient = userType === "client";

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const gigRes = await api.get("/gigs");
        const gigData: unknown = gigRes.data;

        if (isGigArray(gigData)) {
          setGigs(gigData);
        } else if (
          typeof gigData === "object" &&
          gigData !== null &&
          "gigs" in gigData &&
          isGigArray(gigData.gigs)
        ) {
          setGigs(gigData.gigs);
        } else if (
          typeof gigData === "object" &&
          gigData !== null &&
          "data" in gigData &&
          isGigArray(gigData.data)
        ) {
          setGigs(gigData.data);
        } else {
          console.log("Unexpected gigs response:", gigData);
          setGigs([]);
        }

        if (!isClient) {
          const appRes = await api.get("/applications/me");
          const appData: unknown = appRes.data;

          if (Array.isArray(appData)) {
            setApplications(appData as Application[]);
          } else if (
            typeof appData === "object" &&
            appData !== null &&
            "applications" in appData &&
            Array.isArray(appData.applications)
          ) {
            setApplications(appData.applications as Application[]);
          } else {
            console.log("Unexpected applications response:", appData);
            setApplications([]);
          }
        }
      } catch (error) {
        console.error("Dashboard load failed:", error);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isClient]);

  const hasApplied = (gigId: string) =>
    applications.some((application) => {
      return application.gig_id === gigId || application.gig?.id === gigId;
    });

  const handleApply = async (gigId: string) => {
    try {
      setApplying(gigId);

      await api.post("/applications", {
        gig_id: gigId,
      });

      setApplications((previousApplications) => [
        ...previousApplications,
        {
          id: `temp-${gigId}`,
          status: "applied",
          gig_id: gigId,
        },
      ]);

      toast.success("Applied successfully");
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      const message = apiError.response?.data?.message;

      if (message === "Already applied") {
        toast.error("You have already applied");
      } else if (message === "Gig is full") {
        toast.error("No slots available");
      } else if (message === "Student profile not found") {
        toast.error("Complete your profile first");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setApplying(null);
    }
  };

  const handleViewApplicants = (gigId: string) => {
    if (!gigId) {
      toast.error("Invalid gig ID");
      return;
    }

    router.push(`/dashboard/gigs/${gigId}/applicants`);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-semibold text-green-800">
          {isClient ? "Your Gigs" : "Available Gigs"}
        </h1>

        {gigs.length === 0 && (
          <div className="py-10 text-center text-gray-600">No gigs available</div>
        )}

        <div className="grid gap-4">
          {gigs.map((gig) => {
            const applied = hasApplied(gig.id);
            const isApplying = applying === gig.id;

            if (isClient) {
              return (
                <GigCard
                  key={gig.id}
                  gig={gig}
                  onViewApplicants={handleViewApplicants}
                />
              );
            }

            return (
              <div
                key={gig.id}
                className="flex items-center justify-between rounded-xl border border-green-100 bg-white p-5 shadow-sm"
              >
                <div>
                  <h2 className="text-lg font-medium text-gray-800">{gig.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{gig.location}</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    Rs.{gig.pay_per_day} / day
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(gig.id)}
                  disabled={applied || isApplying}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                    applied
                      ? "cursor-not-allowed bg-gray-300 text-gray-500"
                      : isApplying
                        ? "bg-green-300"
                        : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {applied ? "Applied" : isApplying ? "Applying..." : "Apply"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
