import type {
  EventInfo,
  FaqItem,
  Registration,
  RegistrationInput,
  ScheduleItem,
  Team,
  TeamInput,
} from "./types";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    let body: { error?: { code?: string; message?: string; details?: Record<string, string> } } = {};
    try {
      body = await res.json();
    } catch {
      // non-JSON error body
    }
    throw new ApiError(
      res.status,
      body.error?.code ?? "INTERNAL_ERROR",
      body.error?.message ?? "Something went wrong.",
      body.error?.details ?? {},
    );
  }
  return (await res.json()) as T;
}

const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

export const api = {
  getEvent: () => request<EventInfo>("/event"),
  getSchedule: () => request<{ items: ScheduleItem[] }>("/schedule").then((r) => r.items),
  getFaq: () => request<{ items: FaqItem[] }>("/faq").then((r) => r.items),
  getTeams: (lookingFor?: string) => {
    const q = lookingFor?.trim() ? `?lookingFor=${encodeURIComponent(lookingFor.trim())}` : "";
    return request<{ items: Team[] }>(`/teams${q}`).then((r) => r.items);
  },
  register: (input: RegistrationInput) => post<Registration>("/registrations", input),
  createTeam: (input: TeamInput) => post<Team>("/teams", input),
};
