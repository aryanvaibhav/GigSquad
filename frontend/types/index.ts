export type ApplicationStatus = "applied" | "confirmed" | "rejected";

export interface Gig {
  id: string;
  title: string;
  location: string;
  pay_per_day: number;
  slots: number;
  filled_slots: number;
}

export interface Applicant {
  id: string;
  status: ApplicationStatus;
  student?: {
    name?: string;
    email?: string;
  };
}