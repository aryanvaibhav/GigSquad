"use client";

import { useEffect, useState } from "react";
import useAuth from "@/lib/useAuth";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

type Gig = {
  id: string;
  title: string;
  location: string;
  pay_per_day: number;
};

type Application = {
  id: string;
  status: string;
  gig_id?: string;
  gig?: {
    id: string;
  };
};

export default function DashboardPage() {
  const { loading: authLoading, user } = useAuth();
  const router = useRouter();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const isClient = user?.type === "client";

  // 🔹 Fetch data
  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const gigRes = await api.get("/gigs");

        // 🔥 SAFE GIG HANDLING
        const gigData = gigRes.data;

        if (Array.isArray(gigData)) {
          setGigs(gigData);
        } else if (Array.isArray(gigData?.gigs)) {
          setGigs(gigData.gigs);
        } else if (Array.isArray(gigData?.data)) {
          setGigs(gigData.data);
        } else {
          console.log("Unexpected gigs format:", gigData);
          setGigs([]);
        }

        // 👇 ONLY fetch applications for STUDENTS
        if (!isClient) {
          const appRes = await api.get("/applications/me");

          const appData = appRes.data;

          if (Array.isArray(appData)) {
            setApplications(appData);
          } else if (Array.isArray(appData?.applications)) {
            setApplications(appData.applications);
          } else {
            setApplications([]);
          }
        }

      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isClient]);

  // 🔐 Block UI until auth checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  // 🔹 Student helper
  const hasApplied = (gigId: string) => {
    return applications.some(
      (app) => app.gig_id === gigId || app.gig?.id === gigId
    );
  };

  // 🔹 Apply handler (student)
  const handleApply = async (gigId: string) => {
    try {
      setApplying(gigId);

      await api.post(`/applications`, {
        gig_id: gigId,
      });

      toast.success("Applied successfully");

      setApplications((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          status: "applied",
          gig_id: gigId,
        },
      ]);
    } catch (err: any) {
      const message = err.response?.data?.message;

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

  // 🔹 Client navigation
  const handleViewApplicants = (gigId: string) => {
    console.log("Opening applicants for:", gigId);

    if (!gigId) {
      toast.error("Invalid gig ID");
      return;
    }

    router.push(`/dashboard/gigs/${gigId}/applicants`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          {isClient ? "Your Gigs" : "Available Gigs"}
        </h1>

        {gigs.length === 0 && (
          <div className="text-gray-600 text-center py-10">
            No gigs available
          </div>
        )}

        <div className="grid gap-4">
          {gigs.map((gig) => {
            const applied = hasApplied(gig.id);
            const isApplying = applying === gig.id;

            return (
              <div
                key={gig.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-green-100 flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-medium text-gray-800">
                    {gig.title}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    📍 {gig.location}
                  </p>

                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    ₹{gig.pay_per_day} / day
                  </p>
                </div>

                {/* 🔥 ROLE BASED UI */}
                {isClient ? (
                  <button
                    onClick={() => handleViewApplicants(gig.id)}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-80"
                  >
                    View Applicants
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(gig.id)}
                    disabled={applied || isApplying}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      applied
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : isApplying
                        ? "bg-green-300 text-white"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {applied
                      ? "Applied"
                      : isApplying
                      ? "Applying..."
                      : "Apply"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}