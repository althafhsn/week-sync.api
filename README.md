# WeekSync API

Backend API for **WeekSync**, built with [NestJS](https://nestjs.com/) + TypeScript.

## Tech Stack

- **Framework:** NestJS 12 (Express)
- **Database:** PostgreSQL via [Prisma ORM](https://www.prisma.io/)
- **Validation:** class-validator / class-transformer
- **Testing:** Jest, Supertest
- **Linting:** oxlint, Prettier

## Project Structure

```text
week-sync.api/
├── api/index.ts          # Vercel serverless entry point
├── prisma/
│   ├── schema.prisma      # Models: Project, Role, User
│   └── migrations/        # SQL migration history
├── src/
│   ├── main.ts            # App bootstrap
│   ├── prisma/             # PrismaService (DB connection)
│   └── project/            # Example CRUD module (controller/service/dto)
├── test/                  # e2e tests
└── dist/                  # Build output
```

Each feature module follows: `*.module.ts` → `*.controller.ts` (routes) → `*.service.ts` (logic).

## Getting Started

```bash
git clone <repository-url>
cd week-sync.api
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
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
5. Add env var `DATABASE_URL` (use Neon's **pooled** connection string) — mark it Sensitive. Don't set `PORT`.
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
