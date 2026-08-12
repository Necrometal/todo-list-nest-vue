# agentic-crew

Learning project for building an **agentic review crew** with [Claude Code](https://claude.ai/code): a set of specialist subagents (reviewer, test QA, security, pentest) plus a reporter that aggregates their findings into one committed markdown report — triggered on demand, no CI.

The todo-list app under `backend/` and `frontend/` is **not** the point of this repo — it's the build target the crew practices on. NestJS + Vue + MySQL, chosen because it's a small, realistic surface with auth, ownership boundaries (IDOR-able resources), and CRUD — enough for the crew's checks to have something real to catch.

## Start here

**[docs/CREW.md](docs/CREW.md)** — full usage guide: what each agent checks, prerequisites, every command with a concrete example, report format, safety notes. That's the doc to read to actually run and test the crew.

## Repo layout

```
.claude/agents/      subagent definitions (crew-reviewer, crew-test-qa, crew-security, crew-pentest, crew-reporter)
.claude/commands/     slash commands to trigger the crew from inside a Claude Code session
crew/                 scriptable CLI runner (pnpm crew:review) — same agents, non-interactive entry point
backend/              NestJS todo-list API — the crew's build target, not the deliverable
frontend/             Vue 3 todo-list UI — same
reports/              one markdown file per crew run, committed
```

## Two ways to run the crew

**Interactive, inside a Claude Code session** (recommended — see [docs/CREW.md](docs/CREW.md)):
```bash
claude
# then, inside the session:
/crew-all
```

**Scriptable, from a shell** — same four agents plus the reporter, no interactive session needed:
```bash
cd crew
pnpm install
pnpm crew:review -- --base master --head HEAD --trigger manual --base-url http://localhost:3000
```
`--base-url` (default `http://localhost:3000`) is only used by the pentest agent and must resolve to `localhost`/`127.0.0.1`/`::1` — the script refuses anything else before running.
Exits non-zero if the resulting report's status is `fail` — usable as a local pre-push gate.

## The todo-list app itself

Backend: NestJS + TypeORM + MySQL. Frontend: Vue 3 + Vite + Pinia + Vue Router, Tailwind + PrimeVue. Register/login, profile, add/list/edit todos, per-todo change history. See `CLAUDE.md` for the stack decisions and `PRODUCT.md` for product framing — both written with the explicit caveat that the app's real purpose is being a build target for the crew, not a product in its own right.
