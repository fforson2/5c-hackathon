"use client";

import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };

/** Runs `fn` on mount and whenever it changes; `reload` refetches. */
export function useAsync<T>(fn: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fn().then(
      (data) => !cancelled && setState({ status: "success", data }),
      (err: unknown) =>
        !cancelled &&
        setState({ status: "error", message: err instanceof Error ? err.message : "Something went wrong." }),
    );
    return () => {
      cancelled = true;
    };
  }, [fn, nonce]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setNonce((n) => n + 1);
  }, []);
  return { state, reload };
}
