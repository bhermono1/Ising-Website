# I-Sing Karaoke

A production-ready full-stack web platform for a private-karaoke-room restaurant/bar business: customers browse rooms, book a private room with a paid deposit, and order food/drinks online; admins manage rooms, the menu, reservations, orders, and view revenue analytics.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, PostgreSQL + Prisma, Stripe, Auth.js (NextAuth v5), and Resend.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (dark neon "luxury lounge" theme, `next-themes` for light/dark) |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Auth | Auth.js / NextAuth v5 (Credentials + optional Google OAuth, JWT sessions) |
| Payments | Stripe (Payment Intents + webhooks) |
| Email | Resend (falls back to console logging in dev if unconfigured) |
| File uploads | Vercel Blob (falls back to local `/public/uploads` in dev if unconfigured) |
| Rate limiting | Upstash Redis (no-ops if unconfigured) |
| Validation | Zod |
| Forms | React Hook Form |
| Data fetching (client) | TanStack Query |
| Client state | Zustand (cart) |
| Charts | Recharts |
| Icons / animation | lucide-react, Framer Motion |

## Features

- **Public site**: home, room listing + detail pages, full menu with search/filter, customer reviews.
- **Booking**: live availability per room/date/duration, guest count, Stripe deposit checkout, confirmation email, race-safe slot locking (Postgres `SERIALIZABLE` transaction).
- **Food ordering**: cart, optional association with a reservation, tax calculation, Stripe checkout, kitchen status workflow (Pending → Preparing → Ready → Delivered).
- **Customer dashboard**: upcoming/past reservations, cancellation (with policy-based refunds), orders, printable receipts, profile editing, post-stay reviews.
- **Admin dashboard**: room CRUD with photo upload, reservation approval/check-in/cancellation, menu + category management, order status management, analytics (daily/monthly revenue, occupancy, popular rooms & items), site-wide settings (deposit %, cancellation policy, tax rate).
- **Cross-cutting**: SEO metadata + sitemap/robots, rate limiting on sensitive endpoints, Zod validation on every mutation, custom error/404 boundaries, role-gated routes (middleware + per-page checks), HTML-escaped email templates.

## Project structure

```
prisma/
  schema.prisma        # all models, enums, indexes
  seed.ts               # sample rooms, menu, reviews, admin/customer accounts
src/
  app/                  # routes (App Router)
    (public)            # /, /rooms, /rooms/[slug], /menu, /book, /cart, /login, /register
    dashboard/           # customer dashboard (auth-gated)
    admin/               # admin dashboard (admin-gated)
    api/                 # route handlers: auth, rooms, reservations, orders, menu,
                          # payments/webhooks, reviews, admin analytics & settings, upload
  components/
    ui/                  # design-system primitives (button, card, dialog, select, ...)
    layout/, home/, rooms/, menu/, booking/, cart/, dashboard/, admin/, payments/
  lib/                   # prisma client, auth config, stripe, email, availability engine,
                          # analytics, settings, rate-limit, validations/*
  auth.ts, auth.config.ts, proxy.ts   # Auth.js setup + route protection
```

## Prerequisites

- Node.js 20+
- A PostgreSQL database (local via Homebrew/Docker, or hosted — Neon, Supabase, Railway, RDS, etc.)
- A [Stripe](https://dashboard.stripe.com/test/apikeys) account (test mode is fine for development)
- Optional: [Resend](https://resend.com) account for real emails, [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for image hosting, [Upstash Redis](https://upstash.com) for rate limiting — all three gracefully no-op/fallback in local development if left unconfigured.

## Local setup

```bash
npm install

cp .env.example .env
# then edit .env — at minimum set DATABASE_URL, AUTH_SECRET, STRIPE_SECRET_KEY,
# and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (see "Environment variables" below)

npx prisma migrate dev     # creates tables
npm run db:seed             # sample rooms, menu, reviews + admin/customer accounts

npm run dev
```

Visit `http://localhost:3000`.

### Seeded accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@crescendokaraoke.com` | `Admin1234!` |
| Customer | `customer@example.com` | `Customer1234!` |

### Testing Stripe payments locally

1. Use your Stripe **test mode** keys in `.env`.
2. Forward webhooks to your local server with the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET` in `.env` and restart `npm run dev`.
3. Use [Stripe's test card](https://stripe.com/docs/testing) `4242 4242 4242 4242`, any future expiry, any CVC.

Without a webhook listener running, deposits/orders will be created but never flip from `PENDING`/`UNPAID` to `CONFIRMED`/`PAID` — the webhook is the source of truth for payment confirmation (the dashboard briefly polls after checkout to bridge the small delay).

## Environment variables

See `.env.example` for the full list with inline descriptions. Summary:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | `npx auth secret` or `openssl rand -base64 33` |
| `NEXTAUTH_URL` | Yes (prod) | Your deployed URL |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | From the Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Yes | From `stripe listen` (dev) or your webhook endpoint settings (prod) |
| `RESEND_API_KEY` / `EMAIL_FROM` | No | Without it, emails are logged to the server console instead of sent |
| `BLOB_READ_WRITE_TOKEN` | No | Without it, admin image uploads write to `/public/uploads` locally |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | Without it, rate limiting is a no-op — **set this in production** |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Enables Google sign-in alongside email/password |
| `NEXT_PUBLIC_APP_URL` | Yes | Used for metadata, sitemap, and absolute URLs |

## Useful scripts

```bash
npm run dev          # start dev server (Turbopack)
npm run build        # production build
npm run start        # run a production build
npm run lint         # eslint
npm run db:migrate   # prisma migrate dev
npm run db:deploy    # prisma migrate deploy (production)
npm run db:seed      # re-run the seed script
npm run db:studio    # Prisma Studio (visual DB browser)
```

## Deployment (Vercel + hosted Postgres)

1. **Database**: create a Postgres instance (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and copy its connection string into `DATABASE_URL`.
2. **Push the code** to a GitHub repo and import it in [Vercel](https://vercel.com/new).
3. **Environment variables**: add everything from `.env.example` in the Vercel project settings, using **live** Stripe keys for production.
4. **Run migrations** against the production database before/during first deploy:
   ```bash
   DATABASE_URL="<production-url>" npm run db:deploy
   DATABASE_URL="<production-url>" npm run db:seed   # optional — seeds demo content
   ```
5. **Stripe webhook**: in the Stripe dashboard, add an endpoint at `https://<your-domain>/api/webhooks/stripe` listening for `payment_intent.succeeded` and `payment_intent.payment_failed`, then copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
6. **Vercel Blob**: enable Blob storage for the project (Vercel dashboard → Storage) and copy the generated `BLOB_READ_WRITE_TOKEN` — without it, image uploads will fail in production (there's no writable local filesystem on Vercel).
7. **Upstash Redis**: create a free database at [upstash.com](https://upstash.com) and set `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` — without these, rate limiting silently no-ops, which is fine for a demo but not for production traffic.
8. **Resend**: verify a sending domain and set `RESEND_API_KEY` + `EMAIL_FROM`, or emails will just be logged instead of delivered.
9. Deploy. `npm run build` runs `prisma generate` via the `postinstall` hook automatically.

## Security notes / known trade-offs

- Rate limiting (registration, bookings, checkout, reviews) is a no-op until Upstash env vars are set — required for real production traffic.
- The NextAuth credentials sign-in route itself isn't rate-limited (it's handled internally by Auth.js); consider fronting it with a WAF/Vercel Firewall rule for brute-force protection at scale.
- CSRF: Auth.js's own endpoints carry built-in CSRF protection; custom JSON API routes rely on `SameSite=Lax` session cookies rather than a separate CSRF token, which is an accepted modern baseline for same-origin `fetch`-based mutations.
- `npm audit` reports a moderate advisory in a `postcss` version nested inside Next.js's own dependency tree; it isn't independently upgradable without downgrading Next.js and isn't reachable in this app's usage.
