# 🧩 DDD concepts used in this boilerplate

Domain-Driven Design (DDD) is a way of organizing code so the business rules
— _"a user's email must be valid"_, _"a deleted user can never be
reactivated"_ — live in one clearly-marked place, separate from HTTP,
databases, or any other technical plumbing. This doc explains the handful of
building blocks this boilerplate uses, each linked to the file that
implements it.

**On this page:**
[Value Object](#-value-object-vo) ·
[Entity](#-entity) ·
[Aggregate Root](#-aggregate-root) ·
[Identifier](#-identifier) ·
[Domain Event](#-domain-event) ·
[Domain Error](#-domain-error) ·
[Repository (a Port)](#-repository-a-port) ·
[Bounded Context](#-bounded-context) ·
[Use Case](#-use-case-application-service)

---

## 📦 Value Object (VO)

An object defined entirely by its data — two Value Objects with the same
values are interchangeable, there's no "identity" to track. It validates
itself at creation time, so an invalid one can never exist.

- Base class: [`src/shared/domain/value-object.ts`](../src/shared/domain/value-object.ts)
- Example: [`src/context/identity/domain/user/email.vo.ts`](../src/context/identity/domain/user/email.vo.ts)
  — `Email.fromString('not-an-email')` throws immediately, you can never hold
  a broken `Email` instance.

> 💡 **Why the constructor is `protected`, with a static `fromString(...)`
> instead:** it forces every instance to pass validation — there's no back
> door that skips it.

## 🪪 Entity

An object where _identity_ matters more than its current attribute values —
two `User`s are the same `User` if they share an id, even if one has since
changed email or status.

- Base class: [`src/shared/domain/entity.ts`](../src/shared/domain/entity.ts)

## 👑 Aggregate Root

An Entity that is also the boundary you're allowed to change things through.
You never reach into a `User`'s internals and mutate a field directly — you
call a method on the aggregate root (`user.suspend()`), and it enforces its
own rules about what's a legal change.

- Base class: [`src/shared/domain/aggregate-root.ts`](../src/shared/domain/aggregate-root.ts)
- Example: [`src/context/identity/domain/user/user.ts`](../src/context/identity/domain/user/user.ts)
  — status changes all funnel through one private `transitionTo` method that
  checks an allow-list of legal transitions, so "reactivate a deleted user"
  is structurally impossible, not just discouraged by convention.

## 🔑 Identifier

A Value Object wrapping a raw id string, so entities compare identity through
a type instead of a bare string that could accidentally be compared against
the wrong kind of id.

- Base: [`src/shared/domain/identifier.ts`](../src/shared/domain/identifier.ts)
- Per-context subtype: [`src/context/identity/domain/user/user.identifier.ts`](../src/context/identity/domain/user/user.identifier.ts)
  overrides the factories so `UserIdentifier.generate()` types as
  `UserIdentifier`, not the generic base `Identifier`.

## 📣 Domain Event

A fact: _"this already happened."_ Raised by an aggregate's own business
method, not by the code calling it — the aggregate is the one place that
knows a business-meaningful thing occurred.

- Base: [`src/shared/domain/domain-event.ts`](../src/shared/domain/domain-event.ts)
- Example: [`src/context/identity/domain/events/user-registered.event.ts`](../src/context/identity/domain/events/user-registered.event.ts),
  raised inside `User.register(...)` in `user.ts`, not inside the
  `RegisterUser` use case that calls it.

## 🚫 Domain Error

A dedicated error type for business-rule violations, so calling code can
`catch (e) { if (e instanceof DomainError) }` instead of parsing error
message strings.

- [`src/shared/domain/domain-error.ts`](../src/shared/domain/domain-error.ts)
- Caught once, globally, and turned into an HTTP 400 — see
  [`src/shared/infrastructure/filters/domain-error.filter.ts`](../src/shared/infrastructure/filters/domain-error.filter.ts).
  Neither the use case nor the controller needs a try/catch for this.

## 🗄️ Repository (a Port)

An interface (abstract class, see note below) describing how to persist and
fetch aggregates — owned and defined by the _domain_ layer, implemented by
the _infrastructure_ layer. The domain says "I need to save/find a `User`,"
it doesn't know or care if that's Postgres, an in-memory Map, or anything
else.

- [`src/context/identity/domain/ports/user.repository.ts`](../src/context/identity/domain/ports/user.repository.ts)
- Implemented by: [`src/context/identity/infrastructure/persistence/in-memory-user.repository.ts`](../src/context/identity/infrastructure/persistence/in-memory-user.repository.ts)

This "domain defines the interface, infrastructure implements it" pattern is
called a **Port** (the interface) and an **Adapter** (the implementation) —
hexagonal architecture. `PasswordHasher`, `TokenIssuer`, and
`DomainEventPublisher` are the same pattern, just living in
`application/ports/` instead of `domain/ports/` (see doc 2 for why the
split).

> ⚠️ **Why `abstract class`, not `interface`?** TypeScript interfaces don't
> exist at runtime — they're erased at compile time. NestJS's dependency
> injection needs a real runtime token to wire an interface to its
> implementation, so every port here is an `abstract class` instead. It's
> used purely as an interface (never instantiated directly), just written in
> a form Nest's DI container can hold onto.

## 🏰 Bounded Context

A boundary around a piece of the business (`identity`, `notifications`),
each with its own domain model. `notifications`'s `Notification` aggregate
stores `recipientEmail` as a plain string, _not_ identity's `Email` Value
Object — deliberately, so this context never depends on another context's
domain types. See
[`send-welcome-email.handler.ts`](../src/context/notifications/application/event-handlers/send-welcome-email.handler.ts):
the _only_ line that touches identity's `Email` type is
`event.email.toString()`, right at the boundary — everything past that line
is plain primitives.

Contexts talk to each other only through Domain Events (see doc 2 for the
full cross-context flow), never through a direct import of one context's
service into another.

## ⚙️ Use Case (Application Service)

A single, named operation the application can perform (`RegisterUser`,
`AuthenticateUser`). It orchestrates: validate input, call the domain, call
ports, decide what to persist and what event to publish. It contains no
business rule itself — those live in the domain layer it calls into.

- [`src/context/identity/application/use-cases/register-user.ts`](../src/context/identity/application/use-cases/register-user.ts)

---

➡️ Next: [Architecture Walkthrough](./02-architecture-walkthrough.md) — see
these concepts wired together end to end.
