"use client";

import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { Empty, ErrorNote, Loading, Section } from "./ui";

export function Faq() {
  const { state, reload } = useAsync(api.getFaq);

  return (
    <Section id="faq" title="FAQ">
      {state.status === "loading" && <Loading label="questions" />}
      {state.status === "error" && <ErrorNote message={state.message} onRetry={reload} />}
      {state.status === "success" &&
        (state.data.length === 0 ? (
          <Empty>No questions yet.</Empty>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {state.data.map((item) => (
              <details key={item.id} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium hover:text-accent [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span aria-hidden className="text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-prose text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        ))}
    </Section>
  );
}
