---
status: fail
trigger: manual
branch: feat/todo-categorie
commit: afdd093
pr_number: null
feature: shared
date: 2026-08-12
reviewer_verdict: changes-requested
test_verdict: pass
security_verdict: fail
---

# Crew Review — shared (2026-08-12)

## Reviewer

**Verdict:** changes-requested

- `backend/src/todos/todos.service.ts:43-57` & `backend/src/todos/todos.module.ts` — **Security hole / failing e2e test.** `create` (and `update`) blindly persist `dto.categoryId` without verifying the category belongs to the requesting user. `TodosModule` never imports `CategoriesModule`, so `CategoriesService` cannot even be injected. The e2e test `'rejects assigning a category owned by another user'` will return 201 instead of the expected 403. Import `CategoriesModule` into `TodosModule` and call `categoriesService.findOneForUser(dto.categoryId, ownerId)` before saving when `categoryId` is present.

- `backend/src/todos/entities/todo.entity.ts:29-30` — No FK relationship on `categoryId`; deleting a `Category` leaves orphan `categoryId` values in `todos`. Add `@ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })` + `@JoinColumn()` so the DB nullifies the field automatically, or handle it explicitly in `CategoriesService.remove`.

- `backend/src/categories/categories.service.ts:56` — `update()` does `Object.assign(category, dto)` without filtering `undefined` — inconsistent with `todos.service.ts` which explicitly removes undefined entries before assign. With `transform: true`, a PATCH sending only `color` produces a DTO instance where `name === undefined`; `Object.assign` copies it, potentially trying to save `name: undefined` on a non-nullable column. Apply the same `Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined))` pattern from `todos.service.ts`.

- `backend/src/categories/categories.service.ts:43-46` & `:60-63` — `QueryFailedError` catch promotes **any** DB error to 409 Conflict. A connection timeout or an unexpected constraint violation becomes a misleading conflict response. Check `(error as any).errno === 1062` (MySQL `ER_DUP_ENTRY`) before throwing `ConflictException`.

- `frontend/src/views/CategoriesView.vue:53-55` — `onDelete` has no try/catch. A failed delete is invisible to the user; the item stays in the list with no feedback. Wrap in try/catch and set a store/local error message on failure, mirroring the `onSubmit` pattern above it.

---

## Test QA

**Verdict:** pass

---

**Test commands run:**

- `backend` — `pnpm test -- --testPathPattern="categories|todos"`
  - 1 suite, **7 tests passed** (covers `CategoriesService` + `TodosService` unit tests)

- `frontend` — `pnpm test:unit`
  - 2 files, **9 tests passed** (`categories` store + `todos` store)

> E2e suites (`backend/test/categories.e2e-spec.ts`, `todos.e2e-spec.ts`, `frontend/e2e/categories.spec.ts`) require a live DB + running app — not run here.

---

**Coverage gaps:**

- `backend/src/categories/categories.controller.ts` — full controller (POST/GET/PATCH/DELETE) added with no unit spec; only e2e covers it.

- `backend/src/categories/categories.service.ts` → `update()` — happy path and duplicate-on-update `ConflictException` branch are untested; `categories.service.spec.ts` skips `update` entirely.

- `backend/src/todos/todos.service.spec.ts` → `findAllForUser` — only the `categoryId`-present branch is asserted; the `undefined` (unfiltered) branch of the new ternary has no test.

- `backend/src/todos/dto/update-todo.dto.ts` → `ValidateIf((_, v) => v !== null)` on `categoryId` — DTO validation logic (null passthrough vs UUID enforcement) has no unit coverage.

- `frontend/src/components/categories/` (`CategoryFormModal`, `CategoryList`, `CategoryListItem`) — new components, zero component-level specs; only e2e covers them.

- `frontend/src/components/todos/TodoFilterBar.vue` — new `categoryFilter` model + `Select` binding added, no component spec updated.

- `frontend/src/components/todos/TodoListItem.vue` — new `category` computed + `Tag` rendering added, no component spec.

## Security

**Verdict:** fail

- `backend/src/todos/todos.service.ts:43` — **Missing category-ownership check on todo create/update**, severity **high**. `TodosService.create()` and `update()` accept any `categoryId` UUID from the DTO and persist it without verifying it belongs to the requesting user; `TodosModule` does not import `CategoriesModule`, so `CategoriesService` is not injected. The e2e test at `backend/test/todos.e2e-spec.ts:172` expects 403 but the implementation will return 201 — user A can silently tag their todos with user B's category UUIDs. Fix: inject `CategoriesService` into `TodosService` (add `CategoriesModule` to `TodosModule` imports) and call `categoriesService.findOneForUser(dto.categoryId, ownerId)` before saving when `categoryId` is non-null.

- `backend/src/categories/entities/category.entity.ts:24` — **`ownerId` returned in every API response**, severity **low**. The `Category` entity exposes `ownerId` to clients; it's redundant (the client already knows their own user ID) and leaks the internal user UUID. Fix: add a `@Exclude()` decorator (with `ClassSerializerInterceptor`) or a response DTO that omits `ownerId`.

- `backend/src/categories/dto/create-category.dto.ts:5` — **No `@MaxLength()` on `name`**, severity **low**. An attacker can send a multi-megabyte string, wasting DB column space and hitting the unique-index. Fix: add `@MaxLength(100)` (or appropriate limit) to both `CreateCategoryDto` and `UpdateCategoryDto`.

## Summary

Build fails review: one high-severity security bug blocks merge — `TodosService.create/update` never verify `categoryId` ownership, letting any user tag todos with another user's category UUIDs, and `TodosModule` missing the `CategoriesModule` import means the fix cannot even compile as-is. Resolve the ownership check and FK cascade first; the `undefined`-assign bug in `categories.service.ts:update` and the silent delete failure in `CategoriesView.vue` must also be addressed before this is mergeable.
