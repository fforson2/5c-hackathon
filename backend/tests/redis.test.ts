import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { RedisStore, FileStore, createStoreFromEnv, type RedisLike } from "../src/store.js";

class FakeRedis implements RedisLike {
  sets = new Map<string, Set<string>>();
  lists = new Map<string, string[]>();
  failRpush = false;
  async sadd(k: string, ...m: string[]) {
    const s = this.sets.get(k) ?? new Set<string>();
    this.sets.set(k, s);
    let n = 0;
    for (const x of m) if (!s.has(x)) { s.add(x); n++; }
    return n;
  }
  async srem(k: string, ...m: string[]) {
    const s = this.sets.get(k);
    let n = 0;
    for (const x of m) if (s?.delete(x)) n++;
    return n;
  }
  async lpush(k: string, ...e: string[]) {
    const l = this.lists.get(k) ?? [];
    l.unshift(...e);
    this.lists.set(k, l);
    return l.length;
  }
  async rpush(k: string, ...e: string[]) {
    if (this.failRpush) throw new Error("boom");
    const l = this.lists.get(k) ?? [];
    l.push(...e);
    this.lists.set(k, l);
    return l.length;
  }
  async llen(k: string) { return this.lists.get(k)?.length ?? 0; }
  async lrange(k: string, a: number, b: number) { return (this.lists.get(k) ?? []).slice(a, b + 1); }
}

const reg = (o: object = {}) => ({ name: "Ada", email: "Ada@Pomona.edu", college: "Pomona", year: "Junior", experience: "beginner", ...o });
const team = (o: object = {}) => ({ name: "T", idea: "i", lookingFor: ["Designer"], spotsOpen: 2, contact: "c", ...o });
const make = (redis = new FakeRedis()) => ({ redis, app: createApp({ store: new RedisStore(redis), rateLimitMax: 1000 }) });

describe("RedisStore via API", () => {
  it("registers, counts, and rejects duplicates case-insensitively", async () => {
    const { app } = make();
    const a = await request(app).post("/api/registrations").send(reg());
    expect(a.status).toBe(201);
    expect(Object.keys(a.body).sort()).toEqual(["college", "createdAt", "id", "name"]);
    const b = await request(app).post("/api/registrations").send(reg({ email: "ADA@pomona.edu" }));
    expect(b.status).toBe(409);
    expect(b.body.error.code).toBe("ALREADY_REGISTERED");
    expect((await request(app).get("/api/event")).body.stats).toEqual({ registrations: 1, teams: 0 });
  });
  it("concurrent duplicates: only one succeeds", async () => {
    const { app } = make();
    const rs = await Promise.all([1, 2, 3].map(() => request(app).post("/api/registrations").send(reg())));
    expect(rs.map((r) => r.status).sort()).toEqual([201, 409, 409]);
  });
  it("releases the email if persisting fails", async () => {
    const redis = new FakeRedis();
    const store = new RedisStore(redis);
    redis.failRpush = true;
    await expect(store.addRegistration({ ...reg(), email: "a@b.co", trackId: null, dietary: null } as any)).rejects.toThrow();
    redis.failRpush = false;
    await expect(store.addRegistration({ ...reg(), email: "a@b.co", trackId: null, dietary: null } as any)).resolves.toBeTruthy();
  });
  it("lists teams newest first, filters, and never leaks emails", async () => {
    const { app } = make();
    await request(app).post("/api/registrations").send(reg({ email: "secret.person@pomona.edu" }));
    await request(app).post("/api/teams").send(team({ name: "First", lookingFor: ["Backend dev"] }));
    await request(app).post("/api/teams").send(team({ name: "Second", lookingFor: ["UI Designer"] }));
    const all = (await request(app).get("/api/teams")).body.items;
    expect(all.map((t: any) => t.name)).toEqual(["Second", "First"]);
    expect((await request(app).get("/api/teams?lookingFor=DESIGN")).body.items.map((t: any) => t.name)).toEqual(["Second"]);
    for (const p of ["event", "teams"]) {
      expect(JSON.stringify((await request(app).get(`/api/${p}`)).body)).not.toContain("secret.person");
    }
  });
  it("tolerates pre-parsed objects from the client", async () => {
    const redis = new FakeRedis();
    const store = new RedisStore(redis);
    await store.addTeam({ name: "X", idea: "i", trackId: null, lookingFor: [], spotsOpen: 1, contact: "c" });
    const l = redis.lists.get("5c:teams")!;
    l[0] = JSON.parse(l[0]!);
    expect((await store.listTeams())[0]!.name).toBe("X");
  });
});

describe("store selection and CORS", () => {
  it("uses Redis when env vars are present, else file store", async () => {
    expect(createStoreFromEnv({ UPSTASH_REDIS_REST_URL: "https://x.upstash.io", UPSTASH_REDIS_REST_TOKEN: "t" })).toBeInstanceOf(RedisStore);
    expect(createStoreFromEnv({ KV_REST_API_URL: "https://x.upstash.io", KV_REST_API_TOKEN: "t" })).toBeInstanceOf(RedisStore);
    expect(createStoreFromEnv({})).not.toBeInstanceOf(RedisStore);
    expect(createStoreFromEnv({ UPSTASH_REDIS_REST_URL: "https://x" })).not.toBeInstanceOf(RedisStore);
    expect(FileStore).toBeDefined();
  });
  it("CORS_ORIGIN accepts a comma-separated list", async () => {
    const app = createApp({ store: new RedisStore(new FakeRedis()), corsOrigin: "https://a.vercel.app, http://localhost:3000" });
    for (const o of ["https://a.vercel.app", "http://localhost:3000"]) {
      expect((await request(app).get("/api/health").set("Origin", o)).headers["access-control-allow-origin"]).toBe(o);
    }
    expect((await request(app).get("/api/health").set("Origin", "https://evil.com")).headers["access-control-allow-origin"]).toBeUndefined();
  });
});
