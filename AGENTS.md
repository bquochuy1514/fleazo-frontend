# Fleazo Frontend — AGENTS.md

> **Repo:** `fleazo-frontend` — Next.js frontend only.
> Backend lives in `fleazo-backend` (NestJS + Prisma + PostgreSQL), AI service in `fleazo-ai` (Python FastAPI, not yet started).
> **Read `fleazo-backend/AGENTS.md` for API contracts, WebSocket event contract, and domain design decisions** — this file does not duplicate them, only notes what the frontend must know.

## Project Overview

Fleazo is a student secondhand marketplace platform built for Vietnamese university students. This repo is the customer-facing web app (and admin UI).

Same three goals as the backend — real product, revenue-generating, graduation thesis. **Never cut features just because it's a thesis.** Production quality always.

## Tech Stack

### Confirmed

- Framework: Next.js (App Router, `src/` directory, Turbopack)
- Language: TypeScript
- Styling: Tailwind CSS v4
- HTTP client: axios
- Realtime: `socket.io-client` — **required**, backend uses Socket.IO, protocol is not compatible with raw WebSocket

### Undecided — chốt dần khi build tới, rồi chuyển lên mục Confirmed

- Server-state management (TanStack Query?) — decide when building the first data-fetching page
- Client-state management (Zustand?) — decide when building auth state
- UI components: shadcn/ui vs hand-built — decide when building the first real UI
- Form handling (react-hook-form + zod?) — decide when building auth forms
- Token storage strategy (localStorage vs httpOnly cookie) — decide when building auth
- Toast/notification library
- Icon library (lucide-react is the default candidate — used in Huy's other projects)

## Key facts from the backend the frontend must respect

- **Response format:** controllers return service results directly — no `{ statusCode, message, data }` wrapper. Type API responses as the plain data shape.
- **Auth:** JWT access (short-lived) + refresh token rotation + Google OAuth. Axios layer must handle 401 → refresh → retry.
- **Socket lifecycle:** the Socket.IO connection is opened once, app-wide, as soon as the user is logged in — it lives in a top-level provider/layout, NOT inside the Chat page. See backend AGENTS.md → Chat section for the full event contract.
- **Price:** VNĐ, no decimals (`Decimal(12,0)` in DB). Format with a shared `formatPrice` util.
- **Images:** served from Cloudinary (`res.cloudinary.com`) — must be whitelisted in `next.config` `images.remotePatterns`.
- **Location picker:** frontend calls `provinces.open-api.vn/api/v2/` directly (free, no key). 2-level structure only (Tỉnh/Thành phố → Phường/Xã) — do NOT use `/api/v1/` (pre-merger, 3-level, obsolete). Backend stores the selection result (`provinceCode/Name`, `wardCode/Name`), never the reference list.
- **Chat rendering rules:** when `Message.isRecalled` is true, render "message recalled" in place of `content`. No message editing exists — don't build UI for it.
- **Product statuses:** `DRAFT / PENDING / ACTIVE / REJECTED / SOLD / EXPIRED / BANNED / CANCELLED` — public listing pages only ever see `ACTIVE`.

## Key Conventions

- **Import alias:** use `@/` absolute imports (Next.js default) — a deliberate departure from the backend's relative-imports rule. Frontend trees nest deeper and the Next ecosystem assumes `@/`.
- **User-facing text:** Vietnamese. Form validation messages mirror the backend DTO messages (Vietnamese) where the same field exists.
- **Code comments:** English, same as backend.
- Date manipulation: `dayjs` (same as backend)
- ⚠️ Whenever a new shared util/component/hook pattern is established, document it in this file immediately.

## Current Status

- Project scaffolded with `create-next-app` (TypeScript, Tailwind, ESLint, App Router, `src/`, `@/` alias, Turbopack): ⬜ In progress
- Everything else: not started

## Agent Behavior

After completing any meaningful unit of work (feature, fix, refactor, docs update), always provide a suggested commit message at the end of the response.

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/) — same rules as `fleazo-backend`:

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`

**Scope** — frontend module/area (optional but encouraged):
`auth`, `products`, `categories`, `chat`, `profile`, `reviews`, `payments`, `admin`, `ui`, `api`, `config`

**Rules:**

- Subject in English, imperative mood ("add" not "added")
- Do not capitalize the first letter of the subject
- No trailing period in subject
- Subject max 72 characters
