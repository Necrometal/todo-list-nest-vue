# 📚 Documentation

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![Node](https://img.shields.io/badge/Node-22-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)
![Architecture](https://img.shields.io/badge/architecture-DDD%20%2B%20Hexagonal-6E56CF)

> A NestJS boilerplate wired for Domain-Driven Design — written for a
> developer who knows NestJS/TypeScript but has never worked in a DDD
> codebase before. No prior DDD experience required, just follow the trail
> below.

---

## 🧭 Start here — read in this order

| #   | Doc                                                                 | You'll learn                                                                                                                           |
| --- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **[DDD Concepts](./01-ddd-concepts.md)** 🧩                         | The vocabulary — Entity, Value Object, Aggregate, Domain Event, Port/Adapter — each tied to the real file that implements it.          |
| 2   | **[Architecture Walkthrough](./02-architecture-walkthrough.md)** 🏛️ | The folder layout, the dependency rule between layers, a file-by-file guided tour of the `identity` context, and a full request trace. |
| 3   | **[Adding a Feature](./03-adding-a-feature.md)** 🛠️                 | The recipe: extend an existing context, or spin up a brand new bounded context from scratch.                                           |

Each doc assumes the one before it. Don't skip doc 1 — the rest leans on its vocabulary.

---

## 🗺️ Project map

```
src/
├── context/
│   ├── identity/          bounded context — registration, authentication
│   └── notifications/     bounded context — reacts to identity's events
└── shared/                shared kernel — base classes + cross-cutting infra
test/                      e2e tests — one HTTP call in, one assertion out
```

Every bounded context under `src/context/<name>/` splits into four layers —
`domain/`, `application/`, `infrastructure/`, `interface/`. What each layer
is allowed to know about is the whole subject of doc 2.

---

## ⚡ Commands

| Command                             | What it does                                         |
| ----------------------------------- | ---------------------------------------------------- |
| `pnpm start:dev`                    | run the app, restart on file change                  |
| `pnpm lint`                         | ESLint with autofix on `src`, `apps`, `libs`, `test` |
| `pnpm format`                       | Prettier write on `src` + `test`                     |
| `pnpm test`                         | unit tests (Jest, matches `*.spec.ts` inside `src`)  |
| `pnpm test -- register-user`        | run one unit test file by name match                 |
| `pnpm test:watch` / `pnpm test:cov` | watch mode / coverage report                         |
| `pnpm test:e2e`                     | e2e tests (matches `*.e2e-spec.ts` inside `test/`)   |
| `pnpm build`                        | `nest build`                                         |

> 💡 Run these locally before you push: `lint` → `test` → `test:e2e` →
> `build`.
