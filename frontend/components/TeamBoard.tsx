"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { type FormErrors, toFormErrors } from "@/lib/formErrors";
import type { Team, Track } from "@/lib/types";
import { useAsync } from "@/lib/useAsync";
import { Empty, ErrorNote, Field, Loading, Section, buttonClass, describe, inputClass } from "./ui";

const FIELDS = ["name", "idea", "trackId", "lookingFor", "spotsOpen", "contact"] as const;

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

function TeamCard({ team, tracks }: { team: Team; tracks: Track[] }) {
  const track = tracks.find((t) => t.id === team.trackId)?.name;
  return (
    <li className="py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h4 className="text-lg font-medium">{team.name}</h4>
        <p className="text-sm text-muted">
          {team.spotsOpen} {team.spotsOpen === 1 ? "spot" : "spots"} open{track ? ` · ${track}` : ""}
        </p>
      </div>
      <p className="mt-2 max-w-prose text-muted">{team.idea}</p>
      {team.lookingFor.length > 0 && (
        <ul aria-label="Looking for" className="mt-3 flex flex-wrap gap-2">
          {team.lookingFor.map((s, i) => (
            <li key={`${s}-${i}`} className="border border-line px-2 py-0.5 text-sm">{s}</li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm">
        <span className="text-muted">Contact: </span>
        {team.contact}
      </p>
    </li>
  );
}

function TeamForm({ tracks, onPosted }: { tracks: Track[]; onPosted: () => void }) {
  const [errors, setErrors] = useState<FormErrors>({ fields: {} });
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    setSubmitting(true);
    setErrors({ fields: {} });
    try {
      await api.createTeam({
        name: get("name"),
        idea: get("idea"),
        lookingFor: get("lookingFor").split(",").map((s) => s.trim()).filter(Boolean),
        spotsOpen: Number(get("spotsOpen")),
        contact: get("contact"),
        ...(get("trackId") && { trackId: get("trackId") }),
      });
      form.reset();
      setPosted(true);
      onPosted();
    } catch (err) {
      setPosted(false);
      setErrors(toFormErrors(err, FIELDS));
    } finally {
      setSubmitting(false);
    }
  }

  const f = errors.fields;

  return (
    <form onSubmit={onSubmit} aria-busy={submitting} className="grid max-w-xl gap-6">
      <Field id="team-name" label="Team name" error={f.name}>
        <input id="team-name" name="name" required maxLength={60} className={inputClass} {...describe("team-name", f.name)} />
      </Field>
      <Field id="team-idea" label="Idea" error={f.idea} hint="Up to 280 characters.">
        <textarea id="team-idea" name="idea" required maxLength={280} rows={3} className={inputClass} {...describe("team-idea", f.idea, true)} />
      </Field>
      <Field id="team-looking" label="Looking for" error={f.lookingFor} hint="Comma-separated, e.g. design, backend, ML. Max 6.">
        <input id="team-looking" name="lookingFor" className={inputClass} {...describe("team-looking", f.lookingFor, true)} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="team-spots" label="Spots open" error={f.spotsOpen}>
          <select id="team-spots" name="spotsOpen" required defaultValue="2" className={inputClass} {...describe("team-spots", f.spotsOpen)}>
            {[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
          </select>
        </Field>
        <Field id="team-track" label="Track (optional)" error={f.trackId}>
          <select id="team-track" name="trackId" defaultValue="" className={inputClass} {...describe("team-track", f.trackId)}>
            <option value="">Any</option>
            {tracks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
      </div>
      <Field id="team-contact" label="Contact" error={f.contact} hint="Shown publicly, e.g. a Discord handle. Please don't use your email.">
        <input id="team-contact" name="contact" required maxLength={100} className={inputClass} {...describe("team-contact", f.contact, true)} />
      </Field>
      <div aria-live="polite">
        {errors.form && <p role="alert" className="text-sm text-accent">{errors.form}</p>}
        {posted && !errors.form && <p role="status" className="text-sm">Team posted. It&apos;s on the board above.</p>}
      </div>
      <div>
        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Posting…" : "Post team"}
        </button>
      </div>
    </form>
  );
}

export function TeamBoard({ tracks }: { tracks: Track[] }) {
  const [filter, setFilter] = useState("");
  const debounced = useDebounced(filter, 300);
  const load = useCallback(() => api.getTeams(debounced), [debounced]);
  const { state, reload } = useAsync(load);

  return (
    <Section id="teams" title="Teams">
      <p className="max-w-prose text-lg text-muted">
        Find teammates, or post your team and let people come to you.
      </p>

      <div className="mt-10">
        <label htmlFor="team-filter" className="mb-1.5 block text-sm font-medium">
          Filter by skill wanted
        </label>
        <input
          id="team-filter"
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="e.g. design"
          className={`${inputClass} max-w-xs`}
        />
      </div>

      <div className="mt-6" aria-live="polite">
        {state.status === "loading" && <Loading label="teams" />}
        {state.status === "error" && <ErrorNote message={state.message} onRetry={reload} />}
        {state.status === "success" &&
          (state.data.length === 0 ? (
            <Empty>{debounced.trim() ? `No teams looking for “${debounced.trim()}”.` : "No teams yet. Be the first to post one."}</Empty>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {state.data.map((t) => <TeamCard key={t.id} team={t} tracks={tracks} />)}
            </ul>
          ))}
      </div>

      <h3 className="mt-16 mb-6 text-2xl font-semibold tracking-tight">Post a team</h3>
      <TeamForm tracks={tracks} onPosted={reload} />
    </Section>
  );
}
