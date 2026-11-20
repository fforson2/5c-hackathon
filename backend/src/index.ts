import { createApp } from "./create-app.js";
import { createStoreFromEnv } from "./store.js";

const onVercel = Boolean(process.env.VERCEL);

// Default-export the Express app so Vercel entrypoint detection (src/index) can load it.
// Do not name this file's sibling src/app.ts — that wins detection and must be the server.
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
