# WeekSync API — Project Documentation

Companion doc to the [README](../README.md). The README covers setup/run/deploy; this file covers the deeper "how it's built and how to extend it" reference, including the manual-enhancement guide.

> Frontend counterpart: [`week-sync.clientapp/docs/PROJECT_DOCUMENTATION.md`](../../week-sync.clientapp/docs/PROJECT_DOCUMENTATION.md)

## 1. Project Overview

WeekSync is a weekly-report and team-dashboard tool. Team members submit a structured weekly report (tasks worked, hours by type, blockers/achievements, next week's plan); managers review each report and either approve it or send it back with a comment for correction, in a repeatable submit → review → correct → resubmit → approve cycle. Managers also get a team-wide dashboard (submission compliance, open blockers, workload breakdowns) and admin screens to manage users, teams, and projects.

**Target users:** two roles — Team Member (creates/edits their own reports) and Manager (reviews reports, manages users/teams/projects, views the team dashboard). Role is enforced server-side via `RolesGuard`, not just hidden in the UI.

## 2. Technology Stack

| Layer | Choice |
|---|---|
| Framework | NestJS 12 (Express adapter) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT access tokens + rotating, hashed refresh tokens |
| Validation | `class-validator` / `class-transformer` via a global `ValidationPipe` |
| AI search | Qdrant vector store + AI-based filter extraction (`src/vector-store`, `src/ai`) backing `GET /reports/search` |
| Testing | Jest (unit), Supertest (e2e) |
| Linting/formatting | oxlint, Prettier |
| Deployment target | Vercel (serverless entry at `api/index.ts`) |

## 3. Architecture

**Request flow:** `week-sync.clientapp` never calls this API directly from the browser — its Next.js server-side route handlers proxy every call, attaching credentials server-side. This API only trusts requests carrying a valid JWT (`JwtAuthGuard`, applied globally) and, on manager-only routes, a matching role (`RolesGuard` + `@Roles(...)` metadata).

**Module shape:** every feature is a standard Nest module: `*.module.ts` wires up `*.controller.ts` (HTTP routes, thin) and `*.service.ts` (business logic, talks to Prisma). Request/response shapes are typed in `dto/`. This is consistent across every module — copy an existing one when adding a new feature (see §9).

**Data access:** all persistence goes through Prisma (`src/prisma/prisma.service.ts` wraps `PrismaClient` as an injectable). No raw SQL, no other ORM. Schema lives in `prisma/schema.prisma`; every change to it goes through a migration (`npx prisma migrate dev`), never hand-edited in the database.

**Cross-cutting helpers** live in `src/common/`: `pagination.util.ts` and `query-filter.util.ts` standardize list endpoints, `report-access.util.ts` centralizes the "who can read/write this report" rule so it isn't reimplemented per-endpoint.

**Report versioning:** rather than overwriting a report on every correction cycle, `report-content-sync.util.ts` snapshots the full report (status, comment, and all child rows) into `ReportHistory` before applying a correction. This is the one non-obvious architectural decision in the codebase — see the README's "Data Model" section for why.

## 4. Code Quality — Current State & Improvements Made

The codebase was already reasonably consistent (one module-per-feature pattern, shared DTO/pagination/filter utilities, global validation pipe) before this pass. What this cleanup pass changed:

- **Removed unused code** — see the README's "Code Quality Improvements" section for the full list (dead `user-project` module, unused `task`/`report-highlight`/`report-hours` REST surfaces, unused lookup CRUD handlers, a couple of stray unused routes). ~540 lines removed with zero behavior change to anything the frontend, Postman contract tests, or seed script actually exercise.
- **Simplified the shared `LookupService` base class** — since removing unused CRUD handlers left `create`/`findOne`/`update`/`remove` unused across all 8 lookup subclasses, the base class was reduced from a generic `<T, TCreate, TUpdate>` full-CRUD base to a single-purpose `<T>` list-only base. This removed 4 now-orphaned DTO files.
- **Left untouched (intentionally):** business logic, the auth/RBAC design, the report-versioning mechanism, the Prisma schema, and any endpoint with a live caller — this was a deletion/simplification pass, not a rewrite.

Reusable pieces worth knowing about when adding new features: `src/common/pagination.util.ts` (cursor/offset pagination), `src/common/query-filter.util.ts` (generic filter-building for list endpoints), `src/common/report-access.util.ts` (role-based row access), `src/common/lookup/lookup.service.ts` (base class for simple reference-data modules).

## 5. API Documentation

Base path per module shown; all routes require a valid JWT unless noted. `@Roles('Manager')` routes additionally require the caller's role to be Manager.

| Method | Route | Purpose | Consumed by (frontend) |
|---|---|---|---|
| POST | `/auth/signup` | Create a new user account | `signup-client.ts` → `/signup` page |
| POST | `/auth/login` | Authenticate, issue access + refresh tokens | `auth-client.ts` → `/login` page |
| POST | `/auth/refresh` | Exchange a refresh token for a new access token | `backend-fetch.ts`'s automatic-refresh-on-401 logic |
| POST | `/auth/logout` | Revoke the current refresh token | `auth-client.ts`, forced-signout paths |
| PATCH | `/auth/change-password` | Change the logged-in user's password | `/change-password` page |
| POST | `/users` (Manager) | Create a user | Admin `users-client.ts` |
| GET | `/users` | List users (paginated) | `/users` admin page, member pickers |
| GET | `/users/:id` | Get one user | User detail/edit views |
| PATCH | `/users/:id` | Update a user | `/users` admin page |
| DELETE | `/users/:id` (Manager) | Delete a user | `/users` admin page |
| POST | `/project` (Manager) | Create a project | `/projects` admin page |
| GET | `/project` | List projects (paginated) | `/projects` page, project pickers |
| GET | `/project/:id` | Get one project | **Not called by the UI** — kept for the Postman contract test suite only |
| PATCH | `/project/:id` (Manager) | Update a project | `/projects` admin page |
| DELETE | `/project/:id` (Manager) | Delete a project | `/projects` admin page |
| POST | `/teams` (Manager) | Create a team | `/teams` admin page |
| GET | `/teams` | List teams (paginated) | `/teams` page, team pickers |
| PATCH | `/teams/:id` (Manager) | Update a team | `/teams` admin page |
| DELETE | `/teams/:id` (Manager) | Delete a team | `/teams` admin page |
| POST | `/team-members` (Manager) | Add a member to a team | `TeamEditorCard` |
| DELETE | `/team-members/:id` (Manager) | Remove a member from a team | `TeamEditorCard` |
| POST | `/reports` | Create a report (with initial version) | Report create/edit page |
| GET | `/reports` | List reports (paginated, filterable) | `/reports`, `/team/reports` via `useReportListQuery` |
| GET | `/reports/search` | AI/semantic search over reports (Qdrant-backed) | Same pages, AI-search mode |
| GET | `/reports/:id` | Get one report | Report detail/edit pages |
| GET | `/reports/:id/history` | List a report's version history | `VersionHistoryCard` |
| GET | `/reports/:id/history/:historyId` | Get one historical version | `VersionHistoryCard` |
| PATCH | `/reports/:id` | Update a report (edit content, or manager review action) | Report edit page, manager review page |
| GET | `/dashboard/summary` | Aggregate metrics for the team dashboard | `/dashboard`, `TeamAnalytics` |
| GET | `/priority-types`, `/project-statuses`, `/report-highlight-types`, `/report-hour-types`, `/report-statuses`, `/task-statuses`, `/roles`, `/user-statuses` | List reference/lookup data | Filter dropdowns, form selects, badges across the app |

Endpoints not listed above (e.g. `/project/:id` write-only from Postman, or anything removed in this cleanup) either never had a caller or are documented above as contract-only.

## 6. Backend Documentation (module-by-module)

- **`Auth/`** — login/signup/refresh/logout/change-password; `JwtAuthGuard` (global) and `RolesGuard` (per-route via `@Roles`); refresh tokens are hashed at rest and rotated on use.
- **`User/`** — admin-facing user CRUD.
- **`team/`, `team-member/`** — team CRUD and roster (member↔team) assignment.
- **`project/`** — project/category CRUD.
- **`report/`** — the core workflow: create, list, search (AI-backed), get, update (content edits or status transitions), version history. `report-content-sync.util.ts` handles the snapshot-on-correction logic; `report-access.util.ts` enforces who can read/write.
- **`task/`, `report-highlight/`, `report-hours/`** — child data of a report (planned/actual work items, blockers/achievements, hours by type). Only their **services** are exposed now — no standalone controller — since they're always accessed nested under a report.
- **`dashboard/`** — read-only aggregation queries for the manager dashboard.
- **`lookup/`** — one module per reference-data type (priority, statuses, role, etc.), all extending the shared `src/common/lookup/lookup.service.ts` base class; list-only REST surface.
- **`ai/`, `vector-store/`** — AI filter extraction and Qdrant integration backing `/reports/search`; internal dependencies, not their own controllers.
- **`common/`** — pagination, query-filter, and access-control utilities shared across modules; also the base `LookupService`.
- **`prisma/`** — `PrismaService` (injectable DB client) plus `schema.prisma` and migrations.

**Models/DTOs:** each module's `dto/` folder defines its request/response shapes with `class-validator` decorators; the global `ValidationPipe` rejects malformed requests before they reach the service layer. Prisma's generated types (from `schema.prisma`) are the source of truth for entity shapes.

## 7. Changes and Improvements

See §4 above and the README's "Code Quality Improvements" section for the full before/after list. In short: removed ~540 lines of unreachable REST surface (one dead module, three now-service-only modules, several unused individual handlers, unused lookup CRUD), simplified the shared lookup base class to match, and verified `npm run build` still passes with no new test failures.

## 8. Manual Enhancement Guide

**Adding a new API endpoint on an existing module** (e.g. a new report field):
1. Add/update the DTO in `src/<module>/dto/`.
2. Add the service method in `src/<module>/<module>.service.ts` (business logic, Prisma calls).
3. Add the controller route in `src/<module>/<module>.controller.ts` — apply `@Roles('Manager')` if it should be manager-only.
4. If the change touches the schema, run `npx prisma migrate dev --name <description>`.
5. Add/update a test in the module's `*.spec.ts`.

**Adding a whole new feature module** (e.g. a new entity):
1. `nest g module <name>`, `nest g controller <name>`, `nest g service <name>` (or copy an existing small module like `project/` as a template — it's a clean full-CRUD example).
2. Add the model to `prisma/schema.prisma`, run `npx prisma migrate dev --name add-<name>`.
3. Register the new module in `src/app.module.ts`.
4. Wire up pagination/filtering via `src/common/pagination.util.ts` / `query-filter.util.ts` if it's a list endpoint, rather than reimplementing.

**Where business logic goes:** always in the `*.service.ts`, never in the controller — controllers should just map HTTP → service call → response. Cross-cutting rules (e.g., "can this user access this row") belong in `src/common/`, not duplicated per-service.

**Connecting a new endpoint to the frontend:** see the frontend doc's §8 — you'll add a Next.js proxy route under `src/app/api/**` and a typed client function under `src/lib/api/` in `week-sync.clientapp`.

## 9. Known Limitations / Future Improvements

Intentionally not done in this pass (out of scope for a controlled cleanup, listed here rather than silently skipped):

- The lookup CRUD endpoints (`create`/`update`/`remove`/`findOne` on priority types, statuses, etc.) were removed as unused. If an admin UI for managing these is ever wanted, they'd need to be re-added — the trimmed `LookupService` base class would need to grow back into the fuller CRUD base it used to be.
- `ProjectController.findOne` is kept only for Postman contract-test coverage; if that test suite is retired, the route can go too.
- No rate limiting or request throttling is currently configured.
- No structured application-level audit log of who changed what (report history covers report content only, not user/team/project admin actions).
- API versioning (e.g. `/v1/...`) isn't in place; a breaking change today would be a breaking change for every client.
