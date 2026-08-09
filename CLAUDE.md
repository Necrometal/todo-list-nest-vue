# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are my pair programmer senior.

- always answer in english.
- modern code, clean, only comments when necessary
- propose first the simpliest solution and maintainable
- if you generate code, give the ready copy paste (no pseudo-code)
- always ask the missing context before coding
- when you edit existing code, show the diff or the changed part
- explain the tEchniques choices the shortest possible with the clearest explanation

We are going to create a agent's crew through a todo list project with nest and vue js.

1 - First we gonna create  the todo list project.

  * Backend: 
  We gonna use a fresh nest project then build up the todo list step by step,
  We gonna use an architecture adpated to it, not overgearing it

  * Frontend:
  We gonna use a fresh vue project created from cli. Then we gonna build up the front step by step.
  We gonna use tailwind, primevue for our ui

The Todo List will have:
  - login, 
  - register, 
  - profile management
  - add todo
  - list todo
  - edit toto
  - history of change made in todo

We use mysql as database, we already have mysql on docker container so use it for our database



Give me:

- the goal
- constraint
- 2-3 solutions
- the best choice
- why the choice

Then:

- ask me for implementation.
- Analyse the code like in code review.


2 - Second after the todo list setup, we gonna create our crew agent:
  - a reviewer
  - a test qa
  - a security test
  - reporter

## Repo layout

Monorepo, two independent apps, no shared package manager workspace linkage:

- `backend/` — NestJS 11 + TypeScript, pnpm. Freshly scaffolded (default `@nestjs/cli` starter, no domain features yet) — todo-list feature architecture gets built up step by step per the plan above.
- `frontend/` — Vue 3 + TypeScript + Vite, pnpm. Default `create-vue` scaffold (Pinia + Vue Router wired) — no todo-domain structure yet either.

Each has its own `package.json` and lockfile.

## Commands

### Backend (`cd backend`)

```bash
pnpm start:dev              # run with watch
pnpm build                  # nest build
pnpm lint                   # eslint --fix on src/apps/libs/test
pnpm format                 # prettier write src+test
pnpm test                   # unit tests (jest, rootDir src, pattern *.spec.ts)
pnpm test -- <name>         # run test files matching <name>
pnpm test:watch             # watch mode
pnpm test:cov               # coverage report
pnpm test:e2e               # e2e tests (test/*.e2e-spec.ts, separate config test/jest-e2e.json)
```

No `.env` / MySQL wiring yet — add `class-validator`-backed env validation and a TypeORM datasource when persistence is introduced, per the architecture decided for the todo-list feature.

### Frontend (`cd frontend`)

```bash
pnpm dev          # vite dev server
pnpm build        # type-check + vite build
pnpm preview      # preview production build
pnpm type-check   # vue-tsc --build
pnpm lint         # oxlint --fix then eslint --fix --cache
```

## Architecture

Both apps are currently framework defaults with nothing todo-domain-specific built yet:

- **Backend**: default `@nestjs/cli new` output (`src/app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts`). No modules, persistence, or auth wired in. Architecture (module layout, MySQL/TypeORM integration) is chosen per the goal/constraint/solutions flow described in the plan above before implementation starts.
- **Frontend**: standard Vue 3 `create-vue` scaffold — `src/main.ts` bootstraps the app with Pinia (`src/stores/`) and Vue Router (`src/router/index.ts`); views live in `src/views/`, reusable components in `src/components/`. Tailwind + PrimeVue not yet installed.
