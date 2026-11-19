import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
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

export class Store {
  private registrations: Registration[] = [];
  private teams: Team[] = [];
  private emails = new Set<string>();
  private writeChain: Promise<void> = Promise.resolve();

  private constructor(private dir: string) {}

  static async open(dir: string): Promise<Store> {
    const s = new Store(dir);
    await fs.mkdir(dir, { recursive: true });
    s.registrations = await s.read<Registration>("registrations.json");
    s.teams = await s.read<Team>("teams.json");
    s.emails = new Set(s.registrations.map((r) => r.email));
    return s;
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

  stats() {
    return { registrations: this.registrations.length, teams: this.teams.length };
  }

  async addRegistration(input: Omit<Registration, "id" | "createdAt">): Promise<Registration> {
    // Check + insert synchronously so concurrent requests can't both pass.
    if (this.emails.has(input.email)) {
      throw new ApiError(409, "ALREADY_REGISTERED", "This email is already registered");
    }
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

  listTeams(lookingFor?: string): Team[] {
    const q = lookingFor?.trim().toLowerCase();
    return this.teams
      .filter((t) => !q || t.lookingFor.some((s) => s.toLowerCase().includes(q)))
      .map((t, i) => ({ t, i }))
      .sort((a, b) => b.t.createdAt.localeCompare(a.t.createdAt) || b.i - a.i)
      .map(({ t }) => t);
  }
}
