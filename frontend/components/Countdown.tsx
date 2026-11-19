"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function Countdown({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <div className="h-16" aria-hidden />;

  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();

  if (now >= end) return <p className="text-xl text-muted">This event has ended. See you next time.</p>;
  if (now >= start) return <p className="text-xl">Hacking is underway.</p>;

  const p = parts(start - now);
  const items = [
    ["Days", p.days],
    ["Hours", p.hours],
    ["Min", p.minutes],
    ["Sec", p.seconds],
  ] as const;

  return (
    <div role="timer" aria-label="Time until the hackathon starts" className="flex gap-8 sm:gap-12">
      {items.map(([label, value]) => (
        <div key={label}>
          <div className="text-4xl font-light tabular-nums sm:text-5xl">{String(value).padStart(2, "0")}</div>
          <div className="mt-1 text-xs tracking-wide text-muted uppercase">{label}</div>
        </div>
      ))}
    </div>
  );
}
