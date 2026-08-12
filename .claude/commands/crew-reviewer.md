---
description: Run only the reviewer agent on the current diff and write a solo crew report.
argument-hint: [feature]
---

Run the reviewer-only solo flow:

1. Diff: `git diff $(git merge-base master HEAD)...HEAD`. If empty, tell the user there's nothing to review and stop.
2. Feature: use "$ARGUMENTS" if non-empty, otherwise infer from the diff's changed paths (e.g. `backend/src/todos/**` or `frontend/src/**/todos/**` -> `todos`; changes spanning multiple unrelated feature dirs or core/shared files -> `shared`).
3. Glob the affected feature's files for context (skip if feature is `shared` — the reviewer agent looks more broadly itself in that case).
4. Invoke the `crew-reviewer` subagent with: the diff, the feature name, the file list.
5. Invoke the `crew-reporter` subagent with only the reviewer section filled in — pass its raw output verbatim, and `test_verdict: not-run`, `security_verdict: not-run`, `pentest_verdict: not-run`. Metadata: `trigger: manual`, `branch: $(git branch --show-current)`, `commit: $(git rev-parse --short HEAD)`, `pr_number: null`, `feature`, `date` (today, ISO), target path `reports/<date>-manual-<feature>-reviewer-<short-sha>.md`.
6. Report the final report file path back to the user.
