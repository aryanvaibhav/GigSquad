"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AxiosError } from "axios";
import api from "@/lib/api";
import ApplicantCard from "@/components/ApplicantCard";
import { Applicant, ApplicationStatus, UserType } from "@/types";

type ApplicantActionStatus = Extract<ApplicationStatus, "confirmed" | "rejected">;

type ApplicantsResponse =
  | Applicant[]
  | {
      applications?: Applicant[];
      data?: Applicant[];
    };

const isApplicantArray = (value: unknown): value is Applicant[] =>
  Array.isArray(value);

const normalizeApplicants = (payload: unknown): Applicant[] => {
  if (isApplicantArray(payload)) return payload;

  if (typeof payload === "object" && payload !== null) {
    const response = payload as Exclude<ApplicantsResponse, Applicant[]>;

    if (isApplicantArray(response.applications)) return response.applications;
    if (isApplicantArray(response.data)) return response.data;
  }

  return [];
};

export default function ApplicantsPage() {
  const params = useParams<{ id?: string | string[] }>();

  const user =
    typeof window !== "undefined"
      ? (JSON.parse(localStorage.getItem("user") || "{}") as {
          type?: UserType;
          id?: string;
        })
      : null;

  const gigId = useMemo(() => {
    const routeId = params?.id;
    return Array.isArray(routeId) ? routeId[0] : routeId;
  }, [params]);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!gigId) return;

    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        // ✅ Only clients allowed (basic guard)
        if (user?.type !== "client") {
          setErrorMessage("Only clients can view applicants.");
          return;
        }

        // ✅ REAL SOURCE OF TRUTH → backend
        const response = await api.get(`/applications/${gigId}`);
        setApplicants(normalizeApplicants(response.data));

      } catch (error) {
        console.error("Failed to fetch applicants:", error);
        setApplicants([]);

        // ✅ Handle 403 properly
        if (error instanceof AxiosError) {
          if (error.response?.status === 403) {
            setErrorMessage("You are not allowed to view applicants for this gig.");
          } else {
            setErrorMessage(
              error.response?.data?.message || "Failed to load applicants."
            );
          }
        } else {
          setErrorMessage("Unexpected error occurred.");
        }

      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [gigId, user?.type]);

  const handleStatusChange = async (
    applicantId: string,
    status: ApplicantActionStatus
  ) => {
    const previousApplicants = applicants;

    setUpdatingIds((current) => ({
      ...current,
      [applicantId]: true,
    }));

    setApplicants((currentApplicants) =>
      currentApplicants.map((applicant) =>
        applicant.id === applicantId
          ? { ...applicant, status }
          : applicant
      )
    );

    try {
      await api.patch(`/applications/${applicantId}`, { status });
    } catch (error) {
      console.error("Failed to update applicant:", error);
      setApplicants(previousApplicants);
      window.alert("Failed to update applicant status.");
    } finally {
      setUpdatingIds((current) => {
        const next = { ...current };
        delete next[applicantId];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-4xl space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-green-800">
              Applicants
            </h1>
            {gigId && (
              <p className="mt-1 text-sm text-gray-500">
                Gig ID: {gigId}
              </p>
            )}
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-xl border border-green-100 bg-white p-6 text-gray-600 shadow-sm">
            Loading applicants...
          </div>
        )}

        {/* ERROR */}
        {!loading && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            {errorMessage}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !errorMessage && applicants.length === 0 && (
          <div className="rounded-xl border border-green-100 bg-white p-6 text-gray-600 shadow-sm">
            No applicants yet.
          </div>
        )}

        {/* DATA */}
        {!loading && !errorMessage && applicants.length > 0 && (
          <div className="space-y-3">
            {applicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                isUpdating={Boolean(updatingIds[applicant.id])}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}