import path from "node:path";
import { createApp } from "./app.js";
import { Store } from "./store.js";

const port = Number(process.env.PORT ?? 3002);
const store = await Store.open(path.resolve(process.env.DATA_DIR ?? "data"));
const app = createApp({
  store,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 10),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
});
app.listen(port, () => console.log(`API listening on http://localhost:${port}/api`));
