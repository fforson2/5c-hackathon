import express from "express";
import { createApp } from "./create-app.js";
import { createStoreFromEnv } from "./store.js";

// Keep a direct `express` import in this entry file for Vercel detection.
// Do not add a sibling src/app.ts — that filename wins entrypoint detection.
void express;

const onVercel = Boolean(process.env.VERCEL);

const app = createApp({
  store: createStoreFromEnv(),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 10),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  trustProxy: onVercel,
});

// Vercel invokes the exported app; only listen locally.
if (!onVercel) {
  const port = Number(process.env.PORT ?? 3002);
  app.listen(port, () => console.log(`API listening on http://localhost:${port}/api`));
}

export default app;
