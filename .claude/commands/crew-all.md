---
description: Run the full crew (reviewer, test QA, security, pentest) on the current diff and write one combined report.
argument-hint: [feature] [baseUrl]
---

Run the full-crew flow:

1. Diff: `git diff $(git merge-base master HEAD)...HEAD`. If empty, tell the user there's nothing to review and stop.
2. Parse "$ARGUMENTS" as up to two space-separated tokens: `feature` (default: infer from the diff's changed paths, e.g. `backend/src/todos/**` or `frontend/src/**/todos/**` -> `todos`; changes spanning multiple unrelated feature dirs or core/shared files -> `shared`) and `baseUrl` (default `http://localhost:3000`).
3. Sanity-check `baseUrl`'s host is `localhost`, `127.0.0.1`, or `::1` before invoking anything — if not, warn the user and stop (the `crew-pentest` agent enforces this too, but fail fast here).
4. Glob the affected feature's files for context.
5. Invoke, in order: `crew-reviewer` (diff, feature, files), `crew-test-qa` (diff, feature, files), `crew-security` (diff, feature, files), `crew-pentest` (baseUrl, feature, files). Run them independently — one agent's verdict never blocks another from running.
6. Invoke the `crew-reporter` subagent with all four sections filled in — pass each agent's raw output verbatim. Metadata: `trigger: manual`, `branch: $(git branch --show-current)`, `commit: $(git rev-parse --short HEAD)`, `pr_number: null`, `feature`, `date` (today, ISO), target path `reports/<date>-manual-<feature>-full-<short-sha>.md`.
7. Report the final report file path and overall status back to the user.
