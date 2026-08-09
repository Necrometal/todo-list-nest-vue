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
  We gonna use the boilerplate ddd architecture in repository below
  `https://github.com/Necrometal/boilerplate-nest-ddd-architecture`

  So when i say create the backend:
    - clone this repository
    - remove the git folder so we can attach our project to new git repository
    - change the project name to Todo List
  We gonna use this as a base for our backend then build up the todo list step by step

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

- `backend/` — NestJS 11 + TypeScript, DDD/Hexagonal architecture, pnpm
- `frontend/` — Vue 3 + TypeScript + Vite, pnpm

Each has its own `package.json`, lockfile, and CLAUDE.md (`backend/CLAUDE.md` has backend-specific rules — read it when working there).

## Commands

### Backend (`cd backend`)

```bash
pnpm start:dev              # run with watch
pnpm build                  # nest build
pnpm lint                   # eslint --fix on src/apps/libs/test
pnpm format                 # prettier write src+test
pnpm test                   # unit tests (jest, rootDir src, pattern *.spec.ts)
pnpm test -- register-user  # run one unit test file by name match
pnpm test:watch             # watch mode
pnpm test:cov               # coverage report
pnpm test:e2e               # e2e tests (test/*.e2e-spec.ts, separate config test/jest-e2e.json)
```

Requires `.env` (copy from `.env.example`) — `JWT_SECRET` (min 8 chars) is required, app fails fast at boot if missing/invalid.

### Frontend (`cd frontend`)

```bash
pnpm dev          # vite dev server
pnpm build        # type-check + vite build
pnpm preview      # preview production build
pnpm type-check   # vue-tsc --build
pnpm lint         # oxlint --fix then eslint --fix --cache
```

## Backend architecture (DDD / Hexagonal)

```
backend/src/
├── shared/
│   ├── domain/               base classes every context builds on (Entity, ValueObject, AggregateRoot, DomainEvent, Identifier, DomainError)
│   ├── application/ports/    shared-kernel ports (DomainEventPublisher)
│   └── infrastructure/       config validation, EventEmitter2-based event bus adapter, global DomainError HTTP filter, app.module.ts
└── context/
    ├── identity/              registration & authentication
    │   ├── domain/            User aggregate, Email/PlainPassword/HashedPassword VOs, UserRepository port
    │   ├── application/       use cases (RegisterUser, AuthenticateUser) + ports (PasswordHasher, TokenIssuer)
    │   ├── infrastructure/    InMemoryUserRepository, bcrypt hasher, JWT issuer
    │   └── interface/http/    IdentityController + DTOs
    └── notifications/         reacts to identity's domain events (zero import of identity's code)
        └── same four-layer shape as identity
```

Dependency rule (one-way, enforced by convention not tooling):
- `domain/` depends on nothing else in the app.
- `application/` depends on `domain/` only.
- `infrastructure/` depends on `domain/` + `application/` to implement their ports (e.g. `InMemoryUserRepository implements UserRepository`) — the only layer allowed to import concrete libs like `bcrypt`.
- `interface/` depends on `application/` only.
- Cross-context communication happens only through domain events (`EventEmitter2`), never direct imports between `context/identity` and `context/notifications`.

Every business-rule violation throws `DomainError`; a single global filter (`shared/infrastructure/filters/domain-error.filter.ts`) maps it to a `400`. Environment variables are validated at boot via `class-validator` (`shared/infrastructure/config/environment-variables.ts`) — add new env vars there, not via scattered `process.env.X` reads.

To add a new bounded context, mirror the `identity`/`notifications` four-layer shape and wire it in `shared/infrastructure/modules/app.module.ts`. See `backend/docs/` for the full guided walkthrough (DDD concepts, architecture, adding a feature).

## Frontend architecture

Standard Vue 3 `create-vue` scaffold: `src/main.ts` bootstraps the app with Pinia (`src/stores/`) and Vue Router (`src/router/index.ts`); views live in `src/views/`, reusable components in `src/components/`. No todo-domain structure built yet — this gets built up step by step per the plan above.