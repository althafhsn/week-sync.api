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
| Team & team-member management | `src/team`, `src/team-member`, `src/user-project` |
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
│   ├── project/, user-project/  # Projects/categories, member↔project assignment
│   ├── report/                # Report CRUD, submit/review workflow, version snapshotting
│   ├── task/                  # Task-level rows on a report (planned vs actual, status)
│   ├── report-highlight/      # Blockers & achievements, incl. "key" flag
│   ├── report-hours/          # Hours by task type
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

Create a `.env` file:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
JWT_SECRET="<a long random string>"
CORS_ORIGINS="http://localhost:3001"
PORT=3000
```

Set up the database:

```bash
npx prisma migrate deploy   # apply existing migrations
npx prisma generate         # generate the client
```

> Changing `schema.prisma` yourself? Use `npx prisma migrate dev --name <description>` instead — it creates a migration and regenerates the client.

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
