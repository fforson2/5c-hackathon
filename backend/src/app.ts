import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { ApiError } from "./errors.js";
import { type DataStore, type Team } from "./store.js";
import { eventInfo, faq, schedule } from "./seed.js";
import { parseRegistration, parseTeam } from "./validate.js";
import { rateLimit } from "./rateLimit.js";

export interface AppOptions {
  store: DataStore;
  corsOrigin?: string;
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
  trustProxy?: boolean;
}

const publicTeam = (t: Team) => ({
  id: t.id,
  name: t.name,
  idea: t.idea,
  trackId: t.trackId,
  lookingFor: t.lookingFor,
  spotsOpen: t.spotsOpen,
  contact: t.contact,
  createdAt: t.createdAt,
});

export function createApp(opts: AppOptions) {
  const { store } = opts;
  const app = express();
  app.disable("x-powered-by");
  if (opts.trustProxy) app.set("trust proxy", 1);
  const origins = (opts.corsOrigin ?? "http://localhost:3000").split(",").map((o) => o.trim()).filter(Boolean);
  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: "10kb" }));

  const api = express.Router();
  const limiter = rateLimit(opts.rateLimitMax ?? 10, opts.rateLimitWindowMs ?? 60_000);

  api.get("/health", (_req, res) => { res.json({ status: "ok" }); });
  api.get("/event", async (_req, res) => { res.json({ ...eventInfo, stats: await store.stats() }); });
  api.get("/schedule", (_req, res) => {
    res.json({ items: [...schedule].sort((a, b) => a.startsAt.localeCompare(b.startsAt)) });
  });
  api.get("/faq", (_req, res) => { res.json({ items: faq }); });

  api.get("/teams", async (req, res) => {
    const lf = typeof req.query.lookingFor === "string" ? req.query.lookingFor : undefined;
    res.json({ items: (await store.listTeams(lf)).map(publicTeam) });
  });

  api.post("/registrations", limiter, async (req, res) => {
    const input = parseRegistration(req.body);
    const reg = await store.addRegistration(input);
    res.status(201).json({ id: reg.id, name: reg.name, college: reg.college, createdAt: reg.createdAt });
  });

  api.post("/teams", limiter, async (req, res) => {
    const input = parseTeam(req.body);
    res.status(201).json(publicTeam(await store.addTeam(input)));
  });

  // Express 5 forwards async rejections to the error handler.
  app.use("/api", api);
  app.use((_req, _res, next) => next(new ApiError(404, "NOT_FOUND", "Route not found")));

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError) {
      res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
      return;
    }
    const status = (err as { status?: number })?.status;
    const type = (err as { type?: string })?.type;
    if (type === "entity.parse.failed") {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Malformed JSON body", details: { body: "must be valid JSON" } } });
      return;
    }
    if (type === "entity.too.large" || status === 413) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Request body too large", details: { body: "too large" } } });
      return;
    }
    console.error("Unhandled error:", (err as Error)?.name);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong", details: {} } });
  };
  app.use(onError);
  return app;
}
