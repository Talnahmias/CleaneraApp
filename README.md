# CleanersApp

Gett-style on-demand cleaning marketplace — book a trusted cleaner in minutes, with live job status.

## Monorepo

| Package | Description |
|---------|-------------|
| `apps/api` | NestJS REST API (auth, jobs, matching, payments stub) |
| `apps/customer-web` | **Customer website** — book cleaning (main app) |
| `apps/admin-web` | Admin dashboard (ops only) |
| `apps/customer-mobile` | Expo customer app |
| `apps/cleaner-mobile` | Expo cleaner app |
| `packages/shared` | Shared enums and TypeScript types |

## Scope (v1 + v1.5)

**v1:** Phone OTP auth, customer booking (now + schedule), addresses, payments stub, job status machine, geo matching, cleaner online/offers, ratings, push/SMS notification records, admin approval & refunds.

**v1.5:** Favorite cleaners, recurring bookings, in-app chat + masked contact, job checklist & completion photos.

Promo codes are **out of scope**.

See [docs/MVP.md](docs/MVP.md) for API routes and data model.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (PostgreSQL + Redis)

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm db:generate
cd apps/api && pnpm exec prisma db push && pnpm db:seed
cd ../..
pnpm --filter @cleaners/api dev           # http://localhost:3001
pnpm --filter @cleaners/customer-web dev  # http://localhost:3002  ← main website
pnpm --filter @cleaners/admin-web dev     # http://localhost:3000  (ops only)
```

### Dev auth

OTP is fixed to `123456` in development.

| Role | Phone |
|------|-------|
| Admin | +10000000001 |
| Customer | +10000000002 |
| Cleaner | +10000000003 |

## Scripts

```bash
pnpm dev          # all apps (turbo)
pnpm build        # build all
pnpm lint         # lint all
pnpm test         # test all
pnpm db:migrate   # Prisma migrate
pnpm db:seed      # seed service types + dev users
```
