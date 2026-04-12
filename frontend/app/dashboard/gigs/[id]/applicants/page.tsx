"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import ApplicantCard from "@/components/ApplicantCard";
import { Applicant, ApplicationStatus } from "@/types";

type ApplicantsResponse =
  | Applicant[]
  | {
      applications?: Applicant[];
      data?: Applicant[];
    };

type ApplicantActionStatus = Extract<ApplicationStatus, "confirmed" | "rejected">;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isApplicantArray = (value: unknown): value is Applicant[] => Array.isArray(value);

const normalizeApplicants = (payload: unknown): Applicant[] => {
  if (isApplicantArray(payload)) {
    return payload;
  }

  if (typeof payload === "object" && payload !== null) {
    const response = payload as Exclude<ApplicantsResponse, Applicant[]>;

    if (isApplicantArray(response.applications)) {
      return response.applications;
    }

    if (isApplicantArray(response.data)) {
      return response.data;
    }
  }

  console.log("Unexpected applicants response:", payload);
  return [];
};

export default function ApplicantsPage() {
  const params = useParams<{ id?: string | string[] }>();

  const gigId = useMemo(() => {
    const routeId = params?.id;

    if (Array.isArray(routeId)) {
      return routeId[0];
    }

    return routeId;
  }, [params]);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!gigId) {
      setApplicants([]);
      setErrorMessage("Invalid gig ID.");
      setLoading(false);
      return;
    }

    if (!UUID_PATTERN.test(gigId)) {
      setApplicants([]);
      setErrorMessage("Invalid gig ID.");
      setLoading(false);
      return;
    }

    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const response = await api.get(`/applications/${gigId}`);
        console.log("Applicants API response:", response.data);

        setApplicants(normalizeApplicants(response.data));
      } catch (error) {
        console.error("Failed to fetch applicants:", error);
        setApplicants([]);
        setErrorMessage("Failed to load applicants.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [gigId]);

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
        applicant.id === applicantId ? { ...applicant, status } : applicant
      )
    );

    try {
      const response = await api.patch(`/applications/${applicantId}`, { status });
      console.log("Applicant status update response:", response.data);
    } catch (error) {
      console.error("Failed to update applicant:", error);
      setApplicants(previousApplicants);
      window.alert("Failed to update applicant status.");
    } finally {
      setUpdatingIds((current) => {
        const nextState = { ...current };
        delete nextState[applicantId];
        return nextState;
      });
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-green-800">Applicants</h1>
            {gigId && <p className="mt-1 text-sm text-gray-500">Gig ID: {gigId}</p>}
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-800 transition hover:bg-green-100"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading && (
          <div className="rounded-xl border border-green-100 bg-white p-6 text-gray-600 shadow-sm">
            Loading applicants...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && applicants.length === 0 && (
          <div className="rounded-xl border border-green-100 bg-white p-6 text-gray-600 shadow-sm">
            No applicants yet.
          </div>
        )}

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
