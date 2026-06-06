# AGENTS.md

## Cursor Cloud specific instructions

### Services

| Service | Port | Required | Command |
|---------|------|----------|---------|
| PostgreSQL + Redis | 5432, 6379 | Yes | `pnpm db:up` (Docker) |
| API | 3001 | Yes | `pnpm --filter @cleaners/api dev` |
| Admin web | 3000 | Optional | `pnpm --filter @cleaners/admin-web dev` |
| Customer mobile | 8081 | Optional | `pnpm --filter @cleaners/customer-mobile dev` |
| Cleaner mobile | 8082 | Optional | `pnpm --filter @cleaners/cleaner-mobile dev` |

Start databases before the API. After first clone, run `pnpm db:generate`, `pnpm --filter @cleaners/api exec prisma db push`, and `pnpm db:seed`.

Copy `.env.example` to `.env` (and `apps/api/.env` symlink or duplicate `DATABASE_URL`).

### Lint / test / build

```bash
pnpm lint
pnpm test
pnpm build
```

API unit tests: `pnpm --filter @cleaners/api test`

### Dev auth

OTP code is always `123456`. Seeded phones: customer `+10000000002`, cleaner `+10000000003`, admin `+10000000001`.

### Notes

- Docker is required for Postgres/Redis. On Cloud VMs use `sudo docker compose up -d` (start `dockerd` first if needed).
- Expo mobile apps use their own `node_modules`; root `pnpm install` links workspace packages.
- Prisma schema lives in `apps/api/prisma/schema.prisma`.
