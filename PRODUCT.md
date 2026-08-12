# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Backend: NestJS + TypeORM + MySQL. Frontend: Vue 3 + Vite + Pinia + Vue Router, with Tailwind CSS and PrimeVue for UI (decided, not yet installed).

## Users

General consumer todo-app users: people managing their own day-to-day personal tasks, as a real multi-user product each person signs into individually.

## Product Purpose

A personal todo list: register, log in, manage a profile, add/list/edit todos, and see the history of changes made to each todo. Success is a working, well-crafted CRUD todo app.

## Positioning

None. Explicitly not competing on a differentiator against other todo apps — it is intentionally "just a todo app." (Its author's real goal beyond the product itself is using it as a build target for a separate reviewer/QA/security/reporter agent crew, but that context does not change what the product should look or feel like to its users.)

## Operating Context

Browser-based web app. Auth-gated: unauthenticated visitors are redirected to login; the todo dashboard is only reachable once signed in.

## Capabilities and Constraints

- Register, login, profile management
- Add, list, edit todos
- Per-todo change history
- Backend and design system are already decided (see Stack); no framework/stack decision remains open.

## Brand Commitments

None yet — open canvas, no existing name or branding to preserve.

## Product Principles

- Clean, functional CRUD todo app — no invented market differentiation.
- Auth-gated by default: every screen except login/register assumes a signed-in user.
- Consumer-grade polish even though the product itself is intentionally simple.
