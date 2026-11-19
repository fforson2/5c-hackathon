"use client";

import { api } from "@/lib/api";
import { formatTime } from "@/lib/format";
import type { ScheduleItem } from "@/lib/types";
import { useAsync } from "@/lib/useAsync";
import { Empty, ErrorNote, Loading, Section } from "./ui";

function groupByDay(items: ScheduleItem[]) {
  const map = new Map<number, ScheduleItem[]>();
  for (const item of items) map.set(item.day, [...(map.get(item.day) ?? []), item]);
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

export function Schedule() {
  const { state, reload } = useAsync(api.getSchedule);

  return (
    <Section id="schedule" title="Schedule">
      {state.status === "loading" && <Loading label="schedule" />}
      {state.status === "error" && <ErrorNote message={state.message} onRetry={reload} />}
      {state.status === "success" &&
        (state.data.length === 0 ? (
          <Empty>The schedule will be posted soon.</Empty>
        ) : (
          <div className="space-y-12">
            {groupByDay(state.data).map(([day, items]) => (
              <div key={day}>
                <h3 className="mb-4 text-lg font-medium">Day {day}</h3>
                <ol className="divide-y divide-line border-y border-line">
                  {items.map((item) => (
                    <li key={item.id} className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr_auto] sm:gap-8">
                      <time dateTime={item.startsAt} className="text-muted tabular-nums">
                        {formatTime(item.startsAt)}
                      </time>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && <p className="text-muted">{item.description}</p>}
                      </div>
                      <p className="text-sm text-muted sm:text-right">{item.location}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ))}
    </Section>
  );
}
