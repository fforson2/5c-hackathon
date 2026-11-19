import type { Prize } from "@/lib/types";
import { Empty, Section } from "./ui";

export function Prizes({ prizes }: { prizes: Prize[] }) {
  return (
    <Section id="prizes" title="Prizes">
      {prizes.length === 0 ? (
        <Empty>Prizes will be announced soon.</Empty>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {prizes.map((p) => (
            <li key={p.place} className="flex items-baseline justify-between gap-6 py-6">
              <div>
                <p className="text-sm text-muted">{p.place}</p>
                <h3 className="text-lg font-medium">{p.title}</h3>
              </div>
              <p className="text-3xl font-light tabular-nums sm:text-4xl">{p.amount}</p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
