import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";
import { ApiError } from "./errors.js";

export interface Registration {
  id: string;
  name: string;
  email: string; // lowercased; never returned by the API
  college: string;
  year: string;
  trackId: string | null;
  experience: string;
  dietary: string | null;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  idea: string;
  trackId: string | null;
  lookingFor: string[];
  spotsOpen: number;
  contact: string;
  createdAt: string;
}

export interface DataStore {
  stats(): Promise<{ registrations: number; teams: number }>;
  addRegistration(input: Omit<Registration, "id" | "createdAt">): Promise<Registration>;
  addTeam(input: Omit<Team, "id" | "createdAt">): Promise<Team>;
  /** Newest first; optional case-insensitive substring filter on lookingFor. */
  listTeams(lookingFor?: string): Promise<Team[]>;
}

const matchesSkill = (t: Team, q?: string) => {
  const needle = q?.trim().toLowerCase();
  return !needle || t.lookingFor.some((s) => s.toLowerCase().includes(needle));
};

const dupError = () => new ApiError(409, "ALREADY_REGISTERED", "This email is already registered");

/** Local JSON-file store (default). */
export class FileStore implements DataStore {
  private registrations: Registration[] = [];
  private teams: Team[] = [];
  private emails = new Set<string>();
  private writeChain: Promise<void> = Promise.resolve();

  private constructor(private dir: string) {}

  static async open(dir: string): Promise<FileStore> {
    const s = new FileStore(dir);
    await fs.mkdir(dir, { recursive: true });
    s.registrations = await s.read<Registration>("registrations.json");
    s.teams = await s.read<Team>("teams.json");
    s.emails = new Set(s.registrations.map((r) => r.email));
    return s;
  }

  /** Lazily opened store, so importing the app has no I/O side effects. */
  static lazy(dir: string): DataStore {
    let p: Promise<FileStore> | undefined;
    const get = () => (p ??= FileStore.open(dir).catch((e) => { p = undefined; throw e; }));
    return {
      stats: async () => (await get()).stats(),
      addRegistration: async (i) => (await get()).addRegistration(i),
      addTeam: async (i) => (await get()).addTeam(i),
      listTeams: async (q) => (await get()).listTeams(q),
    };
  }

  private async read<T>(file: string): Promise<T[]> {
    try {
      const parsed = JSON.parse(await fs.readFile(path.join(this.dir, file), "utf8"));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw e;
    }
  }

  // Atomic write: temp file + rename; writes serialized.
  private persist(file: string, data: unknown): Promise<void> {
    const run = async () => {
      const target = path.join(this.dir, file);
      const tmp = `${target}.${process.pid}.${randomUUID()}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
      await fs.rename(tmp, target);
    };
    const next = this.writeChain.then(run, run);
    this.writeChain = next.catch(() => {});
    return next;
  }

  async stats() {
    return { registrations: this.registrations.length, teams: this.teams.length };
  }

  async addRegistration(input: Omit<Registration, "id" | "createdAt">): Promise<Registration> {
    // Check + insert synchronously so concurrent requests can't both pass.
    if (this.emails.has(input.email)) throw dupError();
    const reg: Registration = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    this.emails.add(reg.email);
    this.registrations.push(reg);
    try {
      await this.persist("registrations.json", this.registrations);
    } catch (e) {
      this.emails.delete(reg.email);
      this.registrations = this.registrations.filter((r) => r !== reg);
      throw e;
    }
    return reg;
  }

  async addTeam(input: Omit<Team, "id" | "createdAt">): Promise<Team> {
    const team: Team = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    this.teams.push(team);
    try {
      await this.persist("teams.json", this.teams);
    } catch (e) {
      this.teams = this.teams.filter((t) => t !== team);
      throw e;
    }
    return team;
  }

  async listTeams(lookingFor?: string): Promise<Team[]> {
    return this.teams
      .filter((t) => matchesSkill(t, lookingFor))
      .map((t, i) => ({ t, i }))
      .sort((a, b) => b.t.createdAt.localeCompare(a.t.createdAt) || b.i - a.i)
      .map(({ t }) => t);
  }
}

/** The subset of the Upstash Redis client used by RedisStore (fakeable in tests). */
export interface RedisLike {
  sadd(key: string, ...members: string[]): Promise<number>;
  srem(key: string, ...members: string[]): Promise<number>;
  lpush(key: string, ...elements: string[]): Promise<number>;
  rpush(key: string, ...elements: string[]): Promise<number>;
  llen(key: string): Promise<number>;
  lrange(key: string, start: number, end: number): Promise<unknown[]>;
}

const MAX_TEAMS_LISTED = 500;

/** Upstash Redis store, for serverless deployments. */
export class RedisStore implements DataStore {
  constructor(private redis: RedisLike, private prefix = "5c") {}

  private k(name: string) {
    return `${this.prefix}:${name}`;
  }

  async stats() {
    const [registrations, teams] = await Promise.all([
      this.redis.llen(this.k("registrations")),
      this.redis.llen(this.k("teams")),
    ]);
    return { registrations, teams };
  }

  async addRegistration(input: Omit<Registration, "id" | "createdAt">): Promise<Registration> {
    // SADD is atomic: returns 0 if the (lowercased) email already exists.
    const added = await this.redis.sadd(this.k("emails"), input.email.toLowerCase());
    if (added === 0) throw dupError();
    const reg: Registration = { ...input, email: input.email.toLowerCase(), id: randomUUID(), createdAt: new Date().toISOString() };
    try {
      await this.redis.rpush(this.k("registrations"), JSON.stringify(reg));
    } catch (e) {
      await this.redis.srem(this.k("emails"), reg.email).catch(() => {});
      throw e;
    }
    return reg;
  }

  async addTeam(input: Omit<Team, "id" | "createdAt">): Promise<Team> {
    const team: Team = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    await this.redis.lpush(this.k("teams"), JSON.stringify(team)); // newest first
    return team;
  }

  async listTeams(lookingFor?: string): Promise<Team[]> {
    const raw = await this.redis.lrange(this.k("teams"), 0, MAX_TEAMS_LISTED - 1);
    // The Upstash client auto-parses JSON strings; accept both forms.
    const teams = raw.map((r) => (typeof r === "string" ? (JSON.parse(r) as Team) : (r as Team)));
    return teams.filter((t) => matchesSkill(t, lookingFor));
  }
}

/** Pick Redis when Upstash/Vercel KV REST env vars are set, otherwise the local file store. */
export function createStoreFromEnv(env: NodeJS.ProcessEnv = process.env): DataStore {
  const url = env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN;
  if (url && token) {
    // automaticDeserialization off: we store/read plain JSON strings ourselves.
    return new RedisStore(new Redis({ url, token, automaticDeserialization: false }) as unknown as RedisLike);
  }
  return FileStore.lazy(path.resolve(env.DATA_DIR ?? "data"));
}
