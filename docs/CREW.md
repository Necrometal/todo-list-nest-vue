# The Review Crew

An agentic code-review/QA/security crew built on [Claude Code](https://claude.ai/code), scoped to this repo's todo-list app (NestJS backend + Vue frontend). Four specialist subagents each check one thing on the current branch's diff (or the running app), and a fifth aggregates their output into one committed markdown report.

No CI wiring — this crew runs on demand, locally, from the Claude Code CLI. You trigger it, you read the report.

## The agents

| Agent | Checks | Scope |
|---|---|---|
| `crew-reviewer` | Code quality, correctness, maintainability | Static diff |
| `crew-test-qa` | Test coverage, runs the relevant test suite | Static diff |
| `crew-security` | Auth, input validation, injection, secrets | Static diff |
| `crew-pentest` | Auth bypass, IDOR, mass assignment, injection, JWT tamper, rate limiting, headers | **Live** running instance — local/dev only |
| `crew-reporter` | Aggregates the above into one report file | — |

Definitions live in [`.claude/agents/`](../.claude/agents/). `crew-reporter` is not run directly — every command below calls it automatically at the end.

## Prerequisites

1. [Claude Code CLI](https://claude.ai/code) installed and authenticated (`claude login`).
2. This repo cloned, with at least one commit of diff against `master` (the crew reviews `git diff` output — running it on a clean `master` checkout with nothing changed will just tell you there's nothing to review).
3. For `crew-pentest` / `/crew-all` only: the backend running locally first.
   ```bash
   cd backend
   pnpm install
   pnpm start:dev   # serves on http://localhost:3000 by default
   ```

## Quick start

From the repo root, open Claude Code:

```bash
claude
```

Then run any command below inside the session.

## Commands

### `/crew-all [feature] [baseUrl]` — full crew, one report

Runs all four agents, then the reporter, in one shot.

```
/crew-all
/crew-all todos http://localhost:3000
```

`feature` and `baseUrl` are both optional — omitted, feature is inferred from the diff's changed paths, and `baseUrl` defaults to `http://localhost:3000`.

### `/crew-reviewer [feature]` — solo code review

```
/crew-reviewer
/crew-reviewer todos
```

### `/crew-test-qa [feature]` — solo test coverage + suite run

```
/crew-test-qa
/crew-test-qa auth
```

### `/crew-security [feature]` — solo static security review

```
/crew-security
/crew-security categories
```

### `/crew-pentest [feature] [baseUrl]` — solo live pentest

Requires the backend to already be running. Only proceeds against `localhost` / `127.0.0.1` / `::1` — refuses any other host.

```
/crew-pentest
/crew-pentest auth http://localhost:3000
```

## Reading the output

Every run writes exactly one markdown file to [`reports/`](../reports/), named `<date>-manual-<feature>-<agent-or-full>-<short-sha>.md`. Each report has frontmatter with a per-agent verdict and an overall `status`:

```yaml
status: pass | fail | needs-review
trigger: manual
branch: <branch>
commit: <sha>
feature: <feature>
reviewer_verdict: <verdict or not-run>
test_verdict: <verdict or not-run>
security_verdict: <verdict or not-run>
pentest_verdict: <verdict or not-run>
```

Solo runs mark the other three sections `not-run` — that's expected, not a failure. See [`reports/2026-08-12-manual-shared-afdd093.md`](../reports/2026-08-12-manual-shared-afdd093.md) for a full-crew example and [`reports/2026-08-12-manual-shared-pentest-b57ff1b.md`](../reports/2026-08-12-manual-shared-pentest-b57ff1b.md) for a solo pentest example.

## Safety notes

- `crew-pentest` creates throwaway test users via the app's own register endpoint and cleans them up via the app's own delete endpoints — no direct DB writes, no destructive commands, no request flooding.
- It hard-refuses to target anything that isn't a local host, regardless of what `baseUrl` argument is passed.
- All agents are read-only on source code — they write nothing except their one report file.
