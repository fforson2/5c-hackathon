import type { ReactNode } from "react";

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-[12rem_1fr] md:gap-16">
        <h2 id={`${id}-title`} className="text-sm font-medium tracking-wide text-muted uppercase">
          {title}
        </h2>
        <div>{children}</div>
      </div>
    </section>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <p role="status" className="text-muted">
      Loading {label}…
    </p>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="text-muted">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 text-fg underline underline-offset-4 hover:text-accent">
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-muted">{children}</p>;
}

export const inputClass =
  "w-full border border-line bg-transparent px-3 py-2.5 text-base text-fg placeholder:text-muted/70 transition-colors hover:border-muted focus:border-fg focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-accent";

export const buttonClass =
  "inline-flex items-center justify-center border border-fg bg-fg px-6 py-3 text-sm font-medium text-bg transition-colors hover:border-accent hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50";

export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

/** aria props wiring an input to its error / hint text. */
export const describe = (id: string, error?: string, hasHint = false) => ({
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
});
