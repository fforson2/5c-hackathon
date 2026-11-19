# Multi-agent team

This project uses a four-agent team defined in `.claude/agents/`:

- **manager** (`.claude/agents/manager.md`): the entry point. Plans the work, assigns it and coordinates review. Never writes app code.
- **frontend** (`.claude/agents/frontend.md`): owns `frontend/`.
- **backend** (`.claude/agents/backend.md`): owns `backend/`.
- **reviewer** (`.claude/agents/reviewer.md`): read-only. Returns `APPROVED` or `CHANGES REQUESTED`.

## Workflow

```
User ──► Manager ──► writes plan (docs/tasks/) + API contract (docs/api-contract.md)
                 ├──► Backend  ─┐   (in parallel when the contract is settled)
                 └──► Frontend ─┤
                                ▼
                            Reviewer ──► CHANGES REQUESTED ──► back to the owner (max 3 rounds)
                                └──────► APPROVED ──► Manager reports to the user
```

## Four terminals

Start with `bin/start-team.sh`, stop with `bin/stop-team.sh` (restart = stop, then start). Four Terminal windows open, each an interactive `claude --agent <role>` session:

| Terminal | Role |
|----------|------|
| manager  | Plans, writes the contract, dispatches jobs |
| frontend | Builds in `frontend/` |
| backend  | Builds in `backend/` |
| reviewer | Read-only review |

Every terminal accepts typed prompts from the user directly, and also receives jobs from the manager. `bin/dispatch <role> <jobfile>` saves the job in `docs/inbox/<role>/` and types a prompt into that role's terminal (window ids live in `docs/.terminals/`). The worker writes its report to `docs/outbox/<role>-<jobid>.md` and moves the job to `docs/done/`. Workers never talk to each other; everything routes through the manager. If a worker is mid-task, a dispatched prompt queues behind it. (`bin/worker.sh` is an older headless mode and is no longer used.)

## Shared conventions

- `docs/api-contract.md` is the single source of truth for the API between frontend and backend. Only the Manager edits it.
- Each request gets a task file in `docs/tasks/`, based on `docs/tasks/_TEMPLATE.md`.
- Agents stay inside the folder they own.
- Nothing counts as done until the reviewer approves it.
