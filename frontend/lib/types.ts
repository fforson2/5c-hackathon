export const COLLEGES = [
  "Pomona",
  "Claremont McKenna",
  "Scripps",
  "Pitzer",
  "Harvey Mudd",
  "Keck Graduate Institute",
  "Other",
] as const;

export const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"] as const;
export const EXPERIENCE = ["beginner", "intermediate", "advanced"] as const;

export type College = (typeof COLLEGES)[number];
export type Year = (typeof YEARS)[number];
export type Experience = (typeof EXPERIENCE)[number];

export interface Track {
  id: string;
  name: string;
  description: string;
}

export interface Prize {
  place: string;
  title: string;
  amount: string;
}

export interface EventInfo {
  name: string;
  tagline: string;
  startsAt: string;
  endsAt: string;
  location: string;
  tracks: Track[];
  prizes: Prize[];
  stats: { registrations: number; teams: number };
}

export interface ScheduleItem {
  id: string;
  day: number;
  startsAt: string;
  title: string;
  description: string;
  location: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface RegistrationInput {
  name: string;
  email: string;
  college: College;
  year: Year;
  trackId?: string;
  experience: Experience;
  dietary?: string;
}

export interface Registration {
  id: string;
  name: string;
  college: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  idea: string;
  trackId: string | null;
  lookingFor: string[];
  spotsOpen: number;
  contact: string;
  createdAt: string;
}

export interface TeamInput {
  name: string;
  idea: string;
  trackId?: string;
  lookingFor: string[];
  spotsOpen: number;
  contact: string;
}
