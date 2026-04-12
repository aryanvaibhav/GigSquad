export type ApplicationStatus = "applied" | "confirmed" | "rejected";

export type UserType = "student" | "client";

export interface Gig {
  id: string;
  title: string;
  location: string;
  pay_per_day: number;
  slots?: number;
  total_slots?: number;
  filled_slots?: number;
  created_by?: string;
}

export interface GigReference {
  id?: string;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  gig_id?: string;
  gig?: GigReference;
}

export interface ApplicantUserDetails {
  name?: string | null;
  email?: string | null;
}

export interface Applicant {
  id: string;
  status: ApplicationStatus;
  student?: ApplicantUserDetails;
  user?: ApplicantUserDetails;
  name?: string | null;
  email?: string | null;
}
