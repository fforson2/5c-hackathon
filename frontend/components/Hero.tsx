import { formatDateRange } from "@/lib/format";
import type { EventInfo } from "@/lib/types";
import { buttonClass } from "./ui";
import { Countdown } from "./Countdown";

export function Hero({ event }: { event: EventInfo }) {
  return (
    <section id="top" aria-labelledby="hero-title" className="fade-in mx-auto max-w-5xl px-6 pt-24 pb-24 sm:pt-36 sm:pb-32">
      <h1 id="hero-title" className="text-6xl font-semibold tracking-tight sm:text-8xl">
        {event.name}
        <span className="text-accent">.</span>
      </h1>
      <p className="mt-6 max-w-xl text-xl text-muted sm:text-2xl">{event.tagline}</p>
      <p className="mt-10 text-base">
        {formatDateRange(event.startsAt, event.endsAt)}
        <span className="mx-3 text-muted" aria-hidden>
          /
        </span>
        {event.location}
      </p>
      <div className="mt-12">
        <Countdown startsAt={event.startsAt} endsAt={event.endsAt} />
      </div>
      <div className="mt-12 flex flex-wrap items-center gap-6">
        <a href="#register" className={buttonClass}>
          Register
        </a>
        <p className="text-sm text-muted">
          {event.stats.registrations} registered · {event.stats.teams} teams
        </p>
      </div>
    </section>
  );
}
