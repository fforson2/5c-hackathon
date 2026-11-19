import { COLLEGES, EXPERIENCE, TRACK_IDS, YEARS } from "./seed.js";
import { ApiError } from "./errors.js";

type Errors = Record<string, string>;

// Strip control characters, trim.
const clean = (s: string) => s.replace(/[\u0000-\u001F\u007F]/g, " ").trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function body(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Request body must be a JSON object", { body: "must be an object" });
  }
  return raw as Record<string, unknown>;
}

function str(o: Record<string, unknown>, k: string, min: number, max: number, errs: Errors): string {
  const v = o[k];
  if (typeof v !== "string") {
    errs[k] = "is required and must be a string";
    return "";
  }
  const s = clean(v);
  if (s.length < min) errs[k] = min === 1 ? "is required" : `must be at least ${min} characters`;
  else if (s.length > max) errs[k] = `must be at most ${max} characters`;
  return s;
}

function oneOf<T extends string>(o: Record<string, unknown>, k: string, allowed: readonly T[], errs: Errors): T | undefined {
  const v = o[k];
  if (typeof v !== "string" || !(allowed as readonly string[]).includes(v)) {
    errs[k] = `must be one of: ${allowed.join(", ")}`;
    return undefined;
  }
  return v as T;
}

function optTrack(o: Record<string, unknown>, errs: Errors): string | null {
  const v = o.trackId;
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string" || !(TRACK_IDS as readonly string[]).includes(v)) {
    errs.trackId = `must be one of: ${TRACK_IDS.join(", ")}`;
    return null;
  }
  return v;
}

function fail(errs: Errors): never {
  throw new ApiError(400, "VALIDATION_ERROR", "Validation failed", errs);
}

export function parseRegistration(raw: unknown) {
  const o = body(raw);
  const errs: Errors = {};
  const name = str(o, "name", 1, 100, errs);
  const email = str(o, "email", 1, 254, errs).toLowerCase();
  if (!errs.email && !EMAIL_RE.test(email)) errs.email = "must be a valid email address";
  const college = oneOf(o, "college", COLLEGES, errs);
  const year = oneOf(o, "year", YEARS, errs);
  const trackId = optTrack(o, errs);
  const experience = oneOf(o, "experience", EXPERIENCE, errs);
  let dietary: string | null = null;
  if (o.dietary !== undefined && o.dietary !== null) {
    const d = str(o, "dietary", 0, 200, errs);
    dietary = d === "" ? null : d;
  }
  if (Object.keys(errs).length) fail(errs);
  return { name, email, college: college!, year: year!, trackId, experience: experience!, dietary };
}

export function parseTeam(raw: unknown) {
  const o = body(raw);
  const errs: Errors = {};
  const name = str(o, "name", 1, 60, errs);
  const idea = str(o, "idea", 1, 280, errs);
  const contact = str(o, "contact", 1, 100, errs);
  const trackId = optTrack(o, errs);

  let lookingFor: string[] = [];
  const lf = o.lookingFor;
  if (lf === undefined || lf === null) {
    lookingFor = [];
  } else if (!Array.isArray(lf)) {
    errs.lookingFor = "must be an array of strings";
  } else if (lf.length > 6) {
    errs.lookingFor = "must have at most 6 items";
  } else {
    for (const item of lf) {
      if (typeof item !== "string") { errs.lookingFor = "must be an array of strings"; break; }
      const s = clean(item);
      if (s.length < 1 || s.length > 30) { errs.lookingFor = "each item must be 1-30 characters"; break; }
      lookingFor.push(s);
    }
  }

  const sp = o.spotsOpen;
  if (typeof sp !== "number" || !Number.isInteger(sp) || sp < 1 || sp > 4) errs.spotsOpen = "must be an integer between 1 and 4";

  if (Object.keys(errs).length) fail(errs);
  return { name, idea, trackId, lookingFor, spotsOpen: sp as number, contact };
}
