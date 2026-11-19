import type { RequestHandler } from "express";
import { ApiError } from "./errors.js";

// Simple fixed-window per-IP limiter (in-memory).
export function rateLimit(max: number, windowMs: number): RequestHandler {
  const hits = new Map<string, { count: number; reset: number }>();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
  }, windowMs);
  timer.unref();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? "unknown";
    let e = hits.get(key);
    if (!e || e.reset <= now) {
      e = { count: 0, reset: now + windowMs };
      hits.set(key, e);
    }
    e.count++;
    if (e.count > max) {
      res.setHeader("Retry-After", Math.ceil((e.reset - now) / 1000));
      return next(new ApiError(429, "RATE_LIMITED", "Too many requests, please try again later"));
    }
    next();
  };
}
