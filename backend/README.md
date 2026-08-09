<div align="center">

# 📝 Todo List — Backend

**NestJS API for the Todo List app, built on a DDD / Hexagonal Architecture boilerplate.**

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node-22-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)
![Conventional Commits](https://img.shields.io/badge/commits-conventional-FE5196?logo=conventionalcommits&logoColor=white)

[📖 Full documentation](./docs/README.md) · [🏛️ Architecture walkthrough](./docs/02-architecture-walkthrough.md) · [🛠️ Add a feature](./docs/03-adding-a-feature.md)

</div>

---

## Why this exists

Most "DDD boilerplate" repos are either a folder of empty `.gitkeep` files, or
a single toy `Todo` example that hides every hard question (cross-context
communication, error mapping, DI for ports, config validation...). This one
ships two real, wired-together bounded contexts — **`identity`**
(register/authenticate users) and **`notifications`** (reacts to what
`identity` publishes) — so you can read working code instead of guessing at
theory.

Every non-obvious decision is documented **in the code itself**, as a comment
next to the line it explains — and the [`docs/`](./docs/) folder walks a
newcomer through the whole thing, file by file, in the order it should be
read.

## ✨ Features

- **Layered by dependency direction, not just by folder name** — `domain/`
  knows nothing about NestJS, HTTP, or any database. `infrastructure/`
  implements the interfaces `domain/`/`application/` define, never the
  reverse.
- **Ports & Adapters (Hexagonal)** — `UserRepository`, `PasswordHasher`,
  `TokenIssuer` are abstract classes owned by the domain/application layer;
  swap `InMemoryUserRepository` for a real database adapter without touching
  a single business rule.
- **Event-driven, decoupled contexts** — `identity` raises
  `UserRegisteredEvent`; `notifications` reacts to it through NestJS's
  `EventEmitter2`, with zero import of `identity`'s code. Add a third context
  tomorrow and neither existing one has to change.
- **Self-validating domain model** — `Email`, `PlainPassword`, `User`'s
  status transitions all reject invalid state at construction time, not
  three layers later.
- **One error type, one HTTP mapping** — every business-rule violation throws
  `DomainError`; a single global filter turns it into a clean `400`. No
  per-route try/catch.
- **Fail fast on bad config** — environment variables are validated at boot
  (`class-validator`), so a missing `JWT_SECRET` crashes startup instead of
  failing mysteriously mid-request.
## 🧱 Tech stack

|                 |                                         |
| --------------- | --------------------------------------- |
| Framework       | [NestJS 11](https://nestjs.com)         |
| Language        | TypeScript 5.7                          |
| Auth            | JWT (`@nestjs/jwt`) + bcrypt            |
| Events          | `@nestjs/event-emitter`                 |
| Validation      | `class-validator` / `class-transformer` |
| Testing         | Jest (unit) + Supertest (e2e)           |
| Package manager | pnpm                                    |

## 📁 Project structure

```
src/
├── context/
│   ├── identity/            registration & authentication
│   │   ├── domain/           User aggregate, Value Objects, ports
│   │   ├── application/      use cases (RegisterUser, AuthenticateUser)
│   │   ├── infrastructure/   in-memory repo, bcrypt, JWT adapters
│   │   └── interface/http/   controller + DTOs
│   └── notifications/        reacts to identity's domain events
└── shared/
    ├── domain/                Entity, ValueObject, AggregateRoot, DomainEvent...
    └── infrastructure/         config validation, event bus adapter, error filter
```

Curious why it's shaped this way? → [Architecture walkthrough](./docs/02-architecture-walkthrough.md)

## 🚀 Quickstart

```bash
git clone git@github.com:Necrometal/boilerplate-nest-ddd-architecture.git
cd boilerplate-nest-ddd-architecture
pnpm install

cp .env.example .env
# edit .env — JWT_SECRET is required (min 8 chars)

pnpm start:dev
```

The API is live at `http://localhost:3000` (or your `PORT`).

### Try it

```bash
# Register a user
curl -X POST http://localhost:3000/identity/register \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"correctH0rse"}'

# Authenticate
curl -X POST http://localhost:3000/identity/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"correctH0rse"}'

# See the welcome-email side effect notifications recorded
curl http://localhost:3000/notifications
```

## 🧪 Testing

```bash
pnpm test        # unit tests
pnpm test:e2e     # end-to-end tests
pnpm test:cov     # coverage report
```

## 📚 Documentation

New to DDD, or just new to this codebase? Start in [`docs/`](./docs/README.md) —
it's written as a guided path, not a reference dump:

1. [DDD Concepts](./docs/01-ddd-concepts.md) — the vocabulary, each term tied to a real file
2. [Architecture Walkthrough](./docs/02-architecture-walkthrough.md) — the dependency rule, a file-by-file reading order, a full request trace
3. [Adding a Feature](./docs/03-adding-a-feature.md) — the recipe for extending it

## 🤝 Contributing

Before opening a PR:

```bash
pnpm lint && pnpm test && pnpm test:e2e && pnpm build
```

## License

Private / unlicensed boilerplate.
