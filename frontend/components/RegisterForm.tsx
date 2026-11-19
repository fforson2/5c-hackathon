"use client";

import { type FormEvent, useRef, useState } from "react";
import { api } from "@/lib/api";
import { type FormErrors, toFormErrors } from "@/lib/formErrors";
import { COLLEGES, EXPERIENCE, YEARS, type Registration, type RegistrationInput, type Track } from "@/lib/types";
import { Field, Section, buttonClass, describe, inputClass } from "./ui";

const FIELDS = ["name", "email", "college", "year", "trackId", "experience", "dietary"] as const;

export function RegisterForm({ tracks }: { tracks: Track[] }) {
  const [errors, setErrors] = useState<FormErrors>({ fields: {} });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Registration | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const input: RegistrationInput = {
      name: get("name"),
      email: get("email"),
      college: get("college") as RegistrationInput["college"],
      year: get("year") as RegistrationInput["year"],
      experience: get("experience") as RegistrationInput["experience"],
      ...(get("trackId") && { trackId: get("trackId") }),
      ...(get("dietary") && { dietary: get("dietary") }),
    };

    setSubmitting(true);
    setErrors({ fields: {} });
    try {
      const reg = await api.register(input);
      setDone(reg);
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (err) {
      setErrors(toFormErrors(err, FIELDS));
    } finally {
      setSubmitting(false);
    }
  }

  const f = errors.fields;

  return (
    <Section id="register" title="Register">
      {done ? (
        <div ref={successRef} tabIndex={-1} role="status" className="outline-none">
          <h3 className="text-3xl font-semibold tracking-tight">You&apos;re in, {done.name.split(" ")[0]}.</h3>
          <p className="mt-3 text-muted">
            Thanks for registering from {done.college}. Next,{" "}
            <a href="#teams" className="text-fg underline decoration-accent underline-offset-4">
              find a team
            </a>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} aria-busy={submitting} className="grid max-w-xl gap-6">
          <Field id="reg-name" label="Name" error={f.name}>
            <input id="reg-name" name="name" required maxLength={100} autoComplete="name" className={inputClass} {...describe("reg-name", f.name)} />
          </Field>
          <Field id="reg-email" label="Email" error={f.email} hint="Used only to confirm your spot. Never shown publicly.">
            <input id="reg-email" name="email" type="email" required autoComplete="email" className={inputClass} {...describe("reg-email", f.email, true)} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="reg-college" label="College" error={f.college}>
              <select id="reg-college" name="college" required defaultValue="" className={inputClass} {...describe("reg-college", f.college)}>
                <option value="" disabled>Select…</option>
                {COLLEGES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field id="reg-year" label="Year" error={f.year}>
              <select id="reg-year" name="year" required defaultValue="" className={inputClass} {...describe("reg-year", f.year)}>
                <option value="" disabled>Select…</option>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </Field>
            <Field id="reg-experience" label="Experience" error={f.experience}>
              <select id="reg-experience" name="experience" required defaultValue="" className={inputClass} {...describe("reg-experience", f.experience)}>
                <option value="" disabled>Select…</option>
                {EXPERIENCE.map((x) => <option key={x} value={x}>{x[0].toUpperCase() + x.slice(1)}</option>)}
              </select>
            </Field>
            <Field id="reg-track" label="Track (optional)" error={f.trackId}>
              <select id="reg-track" name="trackId" defaultValue="" className={inputClass} {...describe("reg-track", f.trackId)}>
                <option value="">Undecided</option>
                {tracks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          </div>
          <Field id="reg-dietary" label="Dietary needs (optional)" error={f.dietary}>
            <input id="reg-dietary" name="dietary" maxLength={200} className={inputClass} {...describe("reg-dietary", f.dietary)} />
          </Field>
          <div aria-live="polite">
            {errors.form && <p role="alert" className="text-sm text-accent">{errors.form}</p>}
          </div>
          <div>
            <button type="submit" disabled={submitting} className={buttonClass}>
              {submitting ? "Registering…" : "Register"}
            </button>
          </div>
        </form>
      )}
    </Section>
  );
}
