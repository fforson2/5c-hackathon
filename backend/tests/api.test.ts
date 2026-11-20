import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createApp } from "../src/create-app.js";
import { FileStore as Store } from "../src/store.js";

let dir: string;
const make = async (rateLimitMax = 1000) => {
  const store = await Store.open(dir);
  return createApp({ store, rateLimitMax });
};
const reg = (o: object = {}) => ({
  name: "  Ada Lovelace ", email: "Ada@Pomona.edu", college: "Pomona", year: "Junior", experience: "beginner", ...o,
});
const team = (o: object = {}) => ({
  name: "Team A", idea: "An idea", lookingFor: ["Designer"], spotsOpen: 2, contact: "ada#1234", ...o,
});

beforeEach(() => { dir = mkdtempSync(path.join(tmpdir(), "5c-")); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe("read endpoints", () => {
  it("health, event, schedule, faq", async () => {
    const app = await make();
    expect((await request(app).get("/api/health")).body).toEqual({ status: "ok" });
    const ev = (await request(app).get("/api/event")).body;
    expect(ev.startsAt).toBe("2027-02-20T17:00:00.000Z");
    expect(ev.tracks.map((t: any) => t.id)).toEqual(["ai", "social-good", "creative", "open"]);
    expect(ev.stats).toEqual({ registrations: 0, teams: 0 });
    const sch = (await request(app).get("/api/schedule")).body.items;
    expect(sch.length).toBeGreaterThanOrEqual(8);
    expect([...sch].sort((a: any, b: any) => a.startsAt.localeCompare(b.startsAt))).toEqual(sch);
    expect((await request(app).get("/api/faq")).body.items.length).toBeGreaterThanOrEqual(6);
  });
  it("404 for unknown route in error format", async () => {
    const res = await request(await make()).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("registrations", () => {
  it("creates, sanitizes, updates stats, hides email", async () => {
    const app = await make();
    const res = await request(app).post("/api/registrations").send(reg());
    expect(res.status).toBe(201);
    expect(Object.keys(res.body).sort()).toEqual(["college", "createdAt", "id", "name"]);
    expect(res.body.name).toBe("Ada Lovelace");
    expect((await request(app).get("/api/event")).body.stats.registrations).toBe(1);
    expect(JSON.parse(readFileSync(path.join(dir, "registrations.json"), "utf8"))).toHaveLength(1);
  });
  it("returns field details on invalid input", async () => {
    const res = await request(await make()).post("/api/registrations")
      .send({ name: "", email: "bad", college: "MIT", year: "x", experience: "pro", trackId: "zzz", dietary: "a".repeat(201) });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(Object.keys(res.body.error.details).sort()).toEqual(["college", "dietary", "email", "experience", "name", "trackId", "year"]);
  });
  it("rejects non-object and malformed JSON", async () => {
    const app = await make();
    expect((await request(app).post("/api/registrations").send([1])).status).toBe(400);
    const res = await request(app).post("/api/registrations").set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
  it("rejects oversized body", async () => {
    const res = await request(await make()).post("/api/registrations").send(reg({ dietary: "x".repeat(20000) }));
    expect(res.status).toBe(400);
  });
  it("409 on duplicate email, case-insensitive", async () => {
    const app = await make();
    await request(app).post("/api/registrations").send(reg());
    const res = await request(app).post("/api/registrations").send(reg({ email: " ADA@pomona.EDU " }));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ALREADY_REGISTERED");
  });
  it("concurrent duplicates: only one succeeds", async () => {
    const app = await make();
    const rs = await Promise.all([1, 2, 3].map(() => request(app).post("/api/registrations").send(reg())));
    expect(rs.map((r) => r.status).sort()).toEqual([201, 409, 409]);
  });
  it("persists across restarts", async () => {
    await request(await make()).post("/api/registrations").send(reg());
    const res = await request(await make()).post("/api/registrations").send(reg());
    expect(res.status).toBe(409);
  });
});

describe("teams", () => {
  it("creates and lists newest first, no email field", async () => {
    const app = await make();
    const a = await request(app).post("/api/teams").send(team({ name: "First" }));
    expect(a.status).toBe(201);
    expect(a.body.trackId).toBeNull();
    await new Promise((r) => setTimeout(r, 5));
    await request(app).post("/api/teams").send(team({ name: "Second", trackId: "ai" }));
    const list = (await request(app).get("/api/teams")).body.items;
    expect(list.map((t: any) => t.name)).toEqual(["Second", "First"]);
    expect(Object.keys(list[0]).sort()).toEqual(["contact", "createdAt", "id", "idea", "lookingFor", "name", "spotsOpen", "trackId"]);
  });
  it("filters lookingFor case-insensitively by substring", async () => {
    const app = await make();
    await request(app).post("/api/teams").send(team({ name: "D", lookingFor: ["UI Designer"] }));
    await request(app).post("/api/teams").send(team({ name: "B", lookingFor: ["Backend dev"] }));
    const r = await request(app).get("/api/teams?lookingFor=DESIGN");
    expect(r.body.items.map((t: any) => t.name)).toEqual(["D"]);
    expect((await request(app).get("/api/teams?lookingFor=zzz")).body.items).toEqual([]);
  });
  it("validates", async () => {
    const res = await request(await make()).post("/api/teams")
      .send({ name: "", idea: "x".repeat(281), lookingFor: Array(7).fill("a"), spotsOpen: 5, contact: "", trackId: "no" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.details).sort()).toEqual(["contact", "idea", "lookingFor", "name", "spotsOpen", "trackId"]);
    const r2 = await request(await make()).post("/api/teams").send(team({ spotsOpen: 1.5, lookingFor: ["x".repeat(31)] }));
    expect(Object.keys(r2.body.error.details).sort()).toEqual(["lookingFor", "spotsOpen"]);
  });
});

describe("no email leak", () => {
  it("email never appears in any response", async () => {
    const app = await make();
    const created = await request(app).post("/api/registrations").send(reg({ email: "secret.person@pomona.edu" }));
    await request(app).post("/api/teams").send(team());
    const all = [created, ...(await Promise.all(["event", "schedule", "faq", "teams", "health"].map((p) => request(app).get(`/api/${p}`))))];
    for (const r of all) expect(JSON.stringify(r.body).toLowerCase()).not.toContain("secret.person");
  });
});

describe("rate limit", () => {
  it("429 after exceeding limit on POSTs", async () => {
    const app = await make(2);
    await request(app).post("/api/teams").send(team());
    await request(app).post("/api/teams").send(team());
    const res = await request(app).post("/api/teams").send(team());
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("RATE_LIMITED");
    expect((await request(app).get("/api/teams")).status).toBe(200);
  });
});
