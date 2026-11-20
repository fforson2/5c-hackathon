import express from "express";
import { createApp } from "./create-app.js";
import { createStoreFromEnv } from "./store.js";

const onVercel = Boolean(process.env.VERCEL);

// `import express` must appear in this entry file so Vercel can detect it.
// Prefer this over a sibling src/app.ts (that filename wins detection).
const app = express();
app.use(
  createApp({
    store: createStoreFromEnv(),
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 10),
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
    trustProxy: onVercel,
  }),
);

// Vercel invokes the exported app; only listen locally.
if (!onVercel) {
  const port = Number(process.env.PORT ?? 3002);
  app.listen(port, () => console.log(`API listening on http://localhost:${port}/api`));
}

export default app;
