# MVP specification — v1 + v1.5

## Customer (mobile)

- Sign in with phone OTP
- Manage addresses
- Browse service types
- Book on-demand or scheduled jobs
- Request favorite cleaner on booking (v1.5)
- View job timeline (REQUESTED → … → COMPLETED)
- Rate cleaner after completion
- Manage favorite cleaners (v1.5)
- Create/cancel recurring bookings (v1.5)
- Chat on active jobs (v1.5)

## Cleaner (mobile)

- Sign in + upload KYC documents
- Go online with location
- Receive job offers, accept/decline
- Update status: EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED
- Complete checklist items (v1.5)
- Upload completion photos (v1.5)
- View earnings

## Admin (web)

- Approve/reject cleaners
- List jobs
- Issue refunds

## API routes

### Public
- `GET /health`
- `GET /service-types`
- `POST /auth/otp/request`
- `POST /auth/otp/verify`

### Customer
- `GET /users/me`
- `GET|POST|DELETE /addresses`
- `GET|POST /jobs`, `PATCH /jobs/:id/status`
- `GET|POST|DELETE /favorites/:cleanerId`
- `GET|POST|DELETE /recurring`
- `GET|POST /jobs/:jobId/chat`, `GET .../contact`
- `POST /ratings`

### Cleaner
- `PATCH /cleaners/presence`
- `GET /cleaners/earnings`
- `POST /cleaners/documents`
- `POST /jobs/offers/:offerId/accept`
- `PATCH /jobs/:id/checklist/:itemId`
- `POST /jobs/:id/photos`

### Admin
- `GET /admin/cleaners/pending`
- `PATCH /admin/cleaners/:userId/status`
- `GET /admin/jobs`
- `POST /admin/jobs/:jobId/refund`

## Job status machine

```
REQUESTED → MATCHING → ASSIGNED → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED
                ↓           ↓          ↓          ↓            ↓
            CANCELLED   CANCELLED  CANCELLED  CANCELLED    CANCELLED
COMPLETED → DISPUTED
```

## Matching

1. Job created → status MATCHING
2. Find online, approved cleaners within radius
3. Rank by distance (boost preferred/favorite cleaner)
4. Send offers to top 5 (60s timeout)
5. First accept → ASSIGNED + notify customer
