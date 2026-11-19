import type { Track } from "@/lib/types";
import { Empty, Section } from "./ui";

export function Tracks({ tracks }: { tracks: Track[] }) {
  return (
    <Section id="tracks" title="Tracks">
      {tracks.length === 0 ? (
        <Empty>Tracks will be announced soon.</Empty>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {tracks.map((t) => (
            <li key={t.id} className="grid gap-2 py-6 sm:grid-cols-[14rem_1fr] sm:gap-8">
              <h3 className="text-lg font-medium">{t.name}</h3>
              <p className="text-muted">{t.description}</p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
