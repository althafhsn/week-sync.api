# WeekSync API

Backend for **WeekSync** — a weekly report generator and team dashboard built for the *Technical Assignment: Weekly Report Generator & Team Dashboard*. It implements the full submit → review → correct → resubmit → approve workflow with role-based access control, versioned report history, and the data behind the team dashboard.

Built with [NestJS](https://nestjs.com/) + TypeScript, PostgreSQL, and Prisma ORM.

> Frontend repo: [`week-sync.clientapp`](../week-sync.clientapp/README.md) — see that README for the frontend setup and for running the two apps together end to end.

## What this covers

| Assignment requirement | Where it lives |
|---|---|
| Auth (register, login/logout, sessions, roles) | `src/Auth` — JWT access + refresh tokens, `RolesGuard` |
| Fixed weekly report structure | `src/report`, `src/task`, `src/report-highlight`, `src/report-hours` |
| Draft → Submitted → Needs Correction → Approved workflow | `src/report/report.service.ts`, enforced via `report-status` lookups |
| Report version history on correction cycles | `src/report/report-content-sync.util.ts` snapshots the report into `ReportHistory` before it's overwritten |
| Role-scoped access (own reports vs. team-wide) | `src/common/report-access.util.ts` + `RolesGuard` on manager-only endpoints |
| Team dashboard data (filters, status, metrics) | `src/dashboard` |
| Projects / categories CRUD | `src/project` |
| Team & team-member management | `src/team`, `src/team-member` |
| Pagination/filtering on list endpoints | `src/common/pagination.util.ts`, `src/common/query-filter.util.ts` |

## Tech Stack

- **Framework:** NestJS 12 (Express)
- **Database:** PostgreSQL via [Prisma ORM](https://www.prisma.io/)
- **Auth:** JWT access tokens + hashed, rotating refresh tokens (`src/Auth`)
- **Validation:** class-validator / class-transformer, enforced via a global `ValidationPipe`
- **Testing:** Jest, Supertest
- **Linting:** oxlint, Prettier

## Data Model

Core entities: `User` (role + status), `Role`, `Team` / `TeamMember`, `Project` / `UserProject` / `TeamProject`, `Report`, and the report's child collections (`Task`, `ReportHighlight` for blockers/achievements, `ReportHours`, `ReportNextWeekTask`).

Status, priority, and category values (`ReportStatus`, `TaskStatus`, `PriorityType`, `ReportHighlightType`, `UserStatus`, `ProjectStatus`) are modelled as lookup tables rather than enums, so managers can extend them without a schema migration.

**Version history:** rather than overwriting a report in place on every correction cycle, `ReportHistory` stores a full JSON snapshot of the report (status, comment, and all child rows) each time it moves out of `Needs Correction`. This keeps every past version — and which version a given manager comment was made against — queryable without a diff engine. See the `ReportHistory` model in [`prisma/schema.prisma`](prisma/schema.prisma).

Full schema: [`prisma/schema.prisma`](prisma/schema.prisma). Migration history: [`prisma/migrations`](prisma/migrations).

## Auth & Role-Based Access

- `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `PATCH /auth/change-password`
- Access tokens are short-lived JWTs; refresh tokens are hashed at rest and rotated on use (`src/Auth/refresh-token.util.ts`).
- `JwtAuthGuard` authenticates every request; `RolesGuard` (`src/Auth/roles.guard.ts`) additionally checks the caller's role against `@Roles(...)` metadata on manager-only routes (e.g. approving/rejecting reports, team-wide dashboard queries).
- Within report endpoints, `src/common/report-access.util.ts` enforces that a Team Member can only read/write their own reports, while a Manager can view any report but can only change its status/comment — never the underlying report content — matching the assignment's access rules exactly.

## Project Structure

```text
week-sync.api/
├── api/index.ts            # Vercel serverless entry point
├── prisma/
│   ├── schema.prisma        # Full data model (users, roles, teams, projects, reports, history, lookups)
│   └── migrations/          # SQL migration history
├── src/
│   ├── main.ts               # App bootstrap, global pipes/interceptors
│   ├── Auth/                 # Login/signup/refresh, JWT guard, roles guard
│   ├── User/                 # User CRUD (admin-facing)
│   ├── team/, team-member/   # Team management, roster assignment
│   ├── project/                # Projects/categories CRUD
│   ├── report/                # Report CRUD, submit/review workflow, version snapshotting
│   ├── task/                  # Task-level rows on a report (service only — no standalone REST surface; consumed via report/)
│   ├── report-highlight/      # Blockers & achievements, incl. "key" flag (service only, same as task/)
│   ├── report-hours/          # Hours by task type (service only, same as task/)
│   ├── dashboard/             # Manager dashboard aggregates (summary metrics, breakdowns)
│   ├── lookup/                # Reference-data modules (statuses, priorities, roles, etc.)
│   ├── common/                # Pagination, filtering, access-control helpers, shared DTOs
│   └── prisma/                # PrismaService (DB connection)
├── test/                    # e2e tests
└── dist/                    # Build output
```

Each feature module follows: `*.module.ts` → `*.controller.ts` (routes) → `*.service.ts` (business logic), with request/response shapes in `dto/`.

## Getting Started

```bash
git clone <repository-url>
cd week-sync.api
npm install
```

Copy the env template and fill in real values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
JWT_SECRET="<a long random string>"
CORS_ORIGINS="http://localhost:3001"
PORT=3000
REFRESH_TOKEN_TTL_DAYS=30

# AI-powered report search (Qdrant vector store)
QDRANT_URL="<qdrant instance url>"
QDRANT_API_KEY="<qdrant api key>"
QDRANT_COLLECTION="reports"

# AI-powered report search (OpenAI-compatible embeddings + chat, for filter extraction)
OPENAI_API_KEY="<openai api key>"
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
OPENAI_EMBEDDINGS_URL="https://api.openai.com/v1/embeddings"
OPENAI_CHAT_MODEL="gpt-4o-mini"
OPENAI_CHAT_URL="https://api.openai.com/v1/chat/completions"
OPENAI_TIMEOUT_SECONDS=30
```

Set up the database:

```bash
npx prisma migrate deploy   # apply existing migrations
npx prisma generate         # generate the client
```

> Changing `schema.prisma` yourself? Use `npx prisma migrate dev --name <description>` instead — it creates a migration and regenerates the client.

### Seed data

[`prisma/seed.ts`](prisma/seed.ts) creates:

- **Reference/lookup data** the app expects to exist — roles (`Manager`, `Team Member`), statuses (project/report/task/user), priority types, report-hour types, and highlight types (achievement/blocker categories).
- **One bootstrap Manager account** (`admin@weeksync.com`, already `Approved` password=`Test@123`— see the `users` array in the script) — this exists because [signup always creates a `Team Member` in `Pending Approval` status](src/Auth/auth.service.ts), so without a seeded Manager there'd be no one able to approve the very first signup.
- **One sample project** ("Orbit Mobile").

```bash
npx prisma db seed
```

Every row is created with `upsert`, so this is safe to (re-)run at any time — including against a database that already has data — it only fills in what's missing, never duplicates or overwrites unrelated rows. Run it once after your first `migrate deploy`, and again after pulling any change to `prisma/seed.ts`.

> The bootstrap account's password isn't documented here (only its bcrypt hash lives in the seed script) — ask whoever set up the project for the credentials, or edit `prisma/seed.ts` to set your own `passwordHash` (generate one with `bcrypt.hash(plaintext, 12)`) before seeding. After that first login, use `/users` to invite/approve everyone else.

## Running

```bash
npm run start        # single run
npm run start:dev    # watch mode (recommended)
npm run start:debug  # watch mode + inspector
npm run start:prod   # run compiled dist/
```

App runs at `http://localhost:3000`.

## Build & Test

```bash
npm run build      # compile to dist/
npm run test       # unit tests
npm run test:e2e   # e2e tests
npm run lint        # lint
npm run format      # format
```

## Deployment (Vercel)

This repo is pre-wired for Vercel:

- `api/index.ts` — serverless entry point (boots Nest once per cold start)
- `vercel.json` — runs `prisma migrate deploy` as the build command
- `postinstall` script runs `prisma generate` after every install

**Steps:**

1. Push to GitHub/GitLab/Bitbucket and import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: choose **Other**.
3. Leave Root Directory / Build Command / Output Directory as default — `vercel.json` handles them.
4. Set Node.js version to match `engines.node` in `package.json`.
5. Add env vars `DATABASE_URL` (Neon's **pooled** connection string), `JWT_SECRET`, `CORS_ORIGINS` — mark secrets as Sensitive. Don't set `PORT`.
6. Deploy. Migrations apply automatically on every deploy.

Need to run a migration manually against a specific database (e.g. one-off backfill)?

```bash
DATABASE_URL="<database-url>" npx prisma migrate deploy
```

### Other deployment options

- **Server/container:** `npm ci --omit=dev && npm run build && node dist/main.js`
- **Docker:** standard Node image, `npm ci`, `npm run build`, `CMD ["node", "dist/main.js"]`
- **NestJS Mau:** `npm install -g @nestjs/mau && mau deploy` — see [Mau docs](https://mau.nestjs.com)

## Resources

- [NestJS Docs](https://docs.nestjs.com)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)

## Code Quality Improvements (`refactor/code-quality-improvements`)

A cleanup pass (branched off `master`, original branch untouched) audited every controller route against actual frontend usage (`week-sync.clientapp`'s `src/lib/api/*` clients and `src/app/api/**` proxy routes), the Postman collection, and the Prisma seed script, then removed what was verifiably unused:

**Removed entirely** (fully dead, no caller anywhere):

- `src/user-project/` module (controller, service, DTOs) — never wired up to anything
- `AppController.getHello` (`GET /`) — leftover Nest scaffold route, plus its now-unused `AppService`
- `TaskController`, `ReportHighlightController`, `ReportHoursController` — the standalone REST surface (`GET /tasks`, `/report-highlights`, `/report-hours`) was never called; these entities are only ever consumed nested under a `Report`. The underlying **services are kept** — `report.service.ts` still uses them internally.

**Trimmed** (kept the module, removed unused handlers):

- `TeamController.findOne`, `TeamMemberController.findAll`/`findOne`, `ReportController.remove`, `RoleController.findOne`, `UserStatusController.findOne` — no proxy route or client call referenced them.
- The 6 lookup controllers (`priority-type`, `project-status`, `report-highlight-type`, `report-hour-type`, `report-status`, `task-status`) — reduced to `findAll` (list) only, since the app only ever reads these as reference data; `create`/`findOne`/`update`/`remove` had no caller. The shared `LookupService` base class was simplified to match.

**Deliberately kept**: `ProjectController.findOne` (`GET /project/:id`) — unused by the product UI, but exercised by `WeekSync.postman_collection.json` as a documented API contract test.

Net effect: ~540 lines removed, `npm run build` passes, and `npm test` has the same pre-existing `ts-jest`/`rootDir` failures that exist on `master` (unrelated to this cleanup — verified via `git stash`).
