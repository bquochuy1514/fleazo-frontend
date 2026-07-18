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
- UI components: **shadcn/ui** — components are copied into the repo (`src/components/ui/`), owned and freely modifiable, not a dependency. Initialized with the **Maia** preset (soft, rounded, consumer-facing) on **Base UI** primitives (`@base-ui/react` — NOT Radix; imports in generated components come from `@base-ui/react/*`). CLI config lives in `components.json` — `iconLibrary` was manually switched from Maia's default `hugeicons` to `lucide`.
- Icons: **lucide-react** — sole icon library (do not add react-icons, hugeicons, or any second icon set)
- Font: single Google font with the `vietnamese` subset, wired to `--font-sans` in the root layout. ⚠️ Figtree and Geist (defaults from create-next-app / Maia preset) do NOT support Vietnamese and were removed — never reintroduce a font without the `vietnamese` subset.
- HTTP client: axios
- Realtime: `socket.io-client` — **required**, backend uses Socket.IO, protocol is not compatible with raw WebSocket

### Undecided — decide incrementally as each area is built, then move to Confirmed

- Server-state management (TanStack Query?) — decide when building the first data-fetching page
- Client-state management (Zustand?) — decide when building auth state
- Form handling (react-hook-form + zod?) — decide when building auth forms
- Token storage strategy (localStorage vs httpOnly cookie) — decide when building auth
- Toast/notification library

⚠️ Framer Motion considered and rejected for now (see Design System → Interactive feedback) — plain Tailwind hover/active scale covers current needs. Revisit only if a genuinely complex animation need comes up.

## Design System

Brand direction: **đáng tin nhưng có hồn** — not corporate-cold, not gen-Z-loud.

### Color tokens (v2 — navy + teal)

⚠️ Superseded the original moss-green + amber palette entirely (v1). Colors below were sampled pixel-exact from a reference mockup the user provided, not designed from scratch. If moss green (`#2F5233`) or amber (`#E0A73B`) shows up anywhere, it's stale — replace it.

Define as CSS variables in `globals.css`, consume via Tailwind — never hardcode hex in components.

| Token                  | Hex       | Role                             |
| ---------------------- | --------- | -------------------------------- |
| `--color-ink`          | `#1C2620` | Primary text                     |
| `--color-base`         | `#F6F5F0` | Page background                  |
| `--color-primary`      | `#03AA5C` | Brand — logo, links, icons       |
| `--color-primary-soft` | `#D7F3E8` | Light fill — placeholders, hover |
| `--color-accent`       | `#00B380` | CTA — buttons, price tags        |
| `--color-danger`       | `#B5533C` | Errors, `REJECTED`/`BANNED` only |
| `--color-header-bg`    | `#111828` | Header surface ONLY — see below  |

Notes:

- `--color-ink` / `--color-base`: unaffected by the v2 change.
- `--color-primary` and `--color-accent` are now both teal — much closer in hue than the old green/amber pair. **Don't eyeball-swap them** — always copy the exact hex/token, never approximate one from memory of the other.
- ⚠️ Contrast checked: white text on either teal fails WCAG AA for normal text (~2.7–3:1). `--primary-foreground` and `--secondary-foreground` in `globals.css` use `--color-ink`, not white — don't "fix" this back to white, it was a deliberate correction.
- `--color-header-bg`: exclusive to the `Header` background bar — not a general-purpose token, don't reuse for cards/badges/other surfaces.
- `--color-danger`: never reused for `SOLD` — that's neutral-good, use `--color-ink` at low opacity overlay instead.

Rule: primary (darker teal, `#03AA5C`) = brand/identity, accent (brighter teal, `#00B380`) = action/money. They read as nearly the same color at a glance now — the separation lives in the exact hex, not in a big visual hue gap like v1.

### Typography

- Display (headings, price display): **Manrope** — variable weight, geometric, distinct from body without clashing
- Body: **Be Vietnam Pro**
- Both must be loaded with the `vietnamese` subset (see Tech Stack → Font). ⚠️ Sen (originally proposed) was rejected — it has no `vietnamese` subset on Google Fonts, only `latin`/`latin-ext`. Don't reintroduce it.
- Prices and any tabular numbers: `font-variant-numeric: tabular-nums`

### Signature element — "tag treo"

Recurring visual motif referencing a physical price tag: small rounded-rect badge, used consistently for:

- Product condition badge (`NEW`/`LIKE_NEW`/`GOOD`/`FAIR`/`POOR`) — color scales from `--color-primary-soft` (new) toward a neutral gray (poor), never random per-condition colors. (v2 note: the old scale ended on amber-light, which no longer exists as a token — reworked to a neutral gray endpoint instead.)
- Price tag overlay on product images
- Status badge (`SOLD` etc.)

### Header surface

The `Header` component uses `--color-header-bg` (dark navy, `#111828`) as a solid background bar, not `--background` — a deliberate exception, because the real logo uses a white wordmark. This token is exclusive to the Header; don't reuse it elsewhere. All header children (nav buttons, icons, search input) are styled explicitly for a dark surface (white text/icons, white search pill) — don't default them to shadcn's `text-foreground`, which assumes a light page background.

The logo asset works directly on this navy bar — contrast measured ~7.3:1 (green wordmark vs `#111828`), passes WCAG AAA. The earlier note about needing a white-wordmark variant was based on the old dark-green (v1) header and is stale; the real logo (`Logo` component, `src/components/logo.tsx`) is already in use here.

Tagline decided: **"The student swap marketplace"** (not yet placed anywhere in code — use when a hero/marketing copy slot is built).

### Component conventions

- `<StatusBadge status="..." />` — single shared component mapping every `ProductStatus`/`ProductCondition` enum value to its color; never write ad-hoc badge markup or hardcoded status colors per page
- Product card is one shared component reused across home, category, search, saved, seller-profile — no per-page duplicates
- Spacing between page sections uses a shared token/util (e.g. `--section-gap`), not repeated raw Tailwind spacing classes copy-pasted per page
- Radius: reuse shadcn's `--radius` scale for controls; cards get `12px` explicitly
- **Button gradients:** `default` variant uses `--color-accent-deep → --color-accent-bright` (= Tailwind's `emerald-500`/`teal-600` hex, kept as tokens rather than hardcoded Tailwind color classes), darkening to `*-hover` tokens (`emerald-600`/`teal-700`) on hover, plus `shadow-fz-accent-deep/20` and `hover:scale-[1.02]`. ⚠️ White text on this pair measures ~2.5–3.7:1 — below WCAG AA (4.5:1). This was flagged and explicitly accepted by the user (aesthetic match to a reference design over strict AA) — don't silently "fix" it back to a higher-contrast pair. `secondary` variant is unchanged — lighter `--color-primary → --color-primary-soft` pair with ink text.
- **Interactive feedback:** every clickable element gets a `hover`/`active` cue — no exceptions, no silent opt-outs. Buttons: `default` variant has its own `hover:scale-[1.02]`; all icon-sized buttons (`icon`/`icon-xs`/`icon-sm`/`icon-lg`) get `hover:scale-110 active:scale-95` via a `compoundVariant` in `button.tsx` (keyed to size, not color variant, so it's automatic for any new icon button regardless of variant). `Logo` is an intentional exception — `hover:opacity-80`, no scale — because scaling a wide horizontal wordmark+icon lockup distorts it and risks overlapping neighboring header elements; opacity is the standard hover cue for logos generally. Plain CSS/Tailwind, not Framer Motion — no animation library is in the stack, and none is needed for scale/opacity-level feedback like this. Only reconsider Framer Motion if a genuinely complex interaction comes up (e.g. the mega menu's open/close transition, exit animations, drag gestures).

- **Response format:** controllers return service results directly — no `{ statusCode, message, data }` wrapper. Type API responses as the plain data shape.
- **Auth:** JWT access (short-lived) + refresh token rotation + Google OAuth. Axios layer must handle 401 → refresh → retry.
- **Socket lifecycle:** the Socket.IO connection is opened once, app-wide, as soon as the user is logged in — it lives in a top-level provider/layout, NOT inside the Chat page. See backend AGENTS.md → Chat section for the full event contract.
- **Price:** VNĐ, no decimals (`Decimal(12,0)` in DB). Format with a shared `formatPrice` util.
- **Images:** served from Cloudinary (`res.cloudinary.com`) — must be whitelisted in `next.config` `images.remotePatterns`.
- **Location picker:** frontend calls `provinces.open-api.vn/api/v2/` directly (free, no key). 2-level structure only (Tỉnh/Thành phố → Phường/Xã) — do NOT use `/api/v1/` (pre-merger, 3-level, obsolete). Backend stores the selection result (`provinceCode/Name`, `wardCode/Name`), never the reference list.
- **Chat rendering rules:** when `Message.isRecalled` is true, render "message recalled" in place of `content`. No message editing exists — don't build UI for it.
- **Product statuses:** `DRAFT / PENDING / ACTIVE / REJECTED / SOLD / EXPIRED / BANNED / CANCELLED` — public listing pages only ever see `ACTIVE`.

## Project Structure

One tree, current state + planned. Items marked `(planned)` don't exist yet — create only when first needed, no empty placeholder folders.

```
src/
├── app/                          # App Router — pages, layouts, route groups
│   ├── layout.tsx                # Root layout: <html>/<body>, font (vietnamese subset),
│   │                             #   lang="vi", future app-wide providers — NO header/footer
│   ├── not-found.tsx             # Global 404 (planned)
│   │
│   ├── (auth)/                   # (planned) Auth screens: centered card layout,
│   │   ├── layout.tsx            #   no marketplace header/footer
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-account/       #   email OTP after register
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   └── (main)/                   # Marketplace shell
│       ├── layout.tsx            # <Header /> + <main> + <Footer /> — MUST live here, not
│       │                         #   inside (public), so (protected) pages get it too
│       ├── (public)/             # Viewable by anyone — SEO matters here
│       │   ├── page.tsx          # Home (/)
│       │   └── ...               # (planned) product detail, category, search,
│       │                         #   seller public profile
│       └── (protected)/          # Requires login — exists, no pages yet
│           ├── layout.tsx        # (planned) auth guard: redirect to /login if not
│           │                     #   authenticated — written ONCE here, never per page
│           └── ...               # (planned) post listing, saved, my profile, chat, settings
│
├── components/
│   ├── ui/                       # shadcn-generated components (button.tsx, ...) —
│   │                             #   owned, freely modifiable, but CLI-managed —
│   │                             #   don't hand-add non-shadcn components here
│   ├── logo.tsx                  # Shared across Header, Footer, AND (auth) pages —
│   │                             #   top-level, not nested under layout/, because
│   │                             #   it isn't exclusive to the app shell
│   └── layout/                   # App shell components: header.tsx, footer.tsx
│
├── lib/                          # Shared non-UI code (see Common Utilities table)
│   ├── api.ts                    # Shared axios instance
│   ├── format.ts                 # formatPrice + future formatting utils
│   └── utils.ts                  # cn() — shadcn class merge util
│
├── styles/
│   └── globals.css               # Tailwind entry + shadcn CSS variables, imported by root
│                                 #   layout. ⚠️ components.json "tailwind.css" must point
│                                 #   here (src/styles/globals.css) or shadcn add breaks
│
├── hooks/                        # (planned) shared hooks (useAuth, useSocket...)
├── types/                        # (planned) TS types mirroring backend API shapes
└── providers/                    # (planned) app-wide providers (socket, state, query client)

components.json                   # shadcn CLI config — read by the CLI, not by app code
public/                           # Static assets served as-is
```

Route groups `(...)` never appear in the URL — they exist only to give each area its own `layout.tsx`. `admin/` (own sidebar layout) is planned but not designed yet.

Rules:

- **Every page** under `(main)` lives in either `(public)` or `(protected)` — no pages directly in `(main)/`. Public **viewing** pages → `(public)`; logged-in **action** pages → `(protected)`. Careful with near-duplicates: seller public profile = public, "my profile" (editing) = protected — two different pages.
- Auth guard logic lives once in `(main)/(protected)/layout.tsx` — never re-check per page.
- Chat will live under `(main)/(protected)` but needs a full-viewport-height layout (hide footer, lock height) — design that when building chat, do not hardcode the footer somewhere hard to remove.

> ⚠️ Keep this tree in sync whenever a folder is added or moved under `src/`.

## Key Conventions

- **Import alias:** use `@/` absolute imports (Next.js default) — a deliberate departure from the backend's relative-imports rule. Frontend trees nest deeper and the Next ecosystem assumes `@/`.
- **User-facing text:** Vietnamese. Form validation messages mirror the backend DTO messages (Vietnamese) where the same field exists.
- **Code comments:** English, same as backend.
- **HTTP calls:** all requests go through the shared axios instance in `src/lib/api.ts` — never import `axios` directly in components/pages.
- **Env vars:** `NEXT_PUBLIC_` prefix required for any variable read on the client. Grouped into named sections with `# ===========================` dividers (same as backend). Every new var must also be added to `.env.example`.
- Date manipulation: `dayjs` (same as backend)
- **Rendering:** default to Server Components (no `"use client"`). Only add `"use client"` to the specific component that needs interactivity (state, event handlers, browser APIs, TanStack Query hooks) — not to whole pages or layouts. `(public)` pages especially should stay server-rendered for SEO; push client-only logic into small leaf components. Exception: `Header` (`src/components/layout/header.tsx`) is itself a Client Component because its shrink-on-scroll effect needs `window.scrollY` — the interactivity belongs to the whole component, not a nested leaf, so it's the component that's client, not its callers. `(main)/layout.tsx` and every page importing it stay Server Components.
- ⚠️ Whenever a new shared util/component/hook pattern is established, document it in this file immediately.

## Common Utilities

Always check for existing utilities before writing new code:

| Path                | Export        | Use when                                                 |
| ------------------- | ------------- | -------------------------------------------------------- |
| `src/lib/api.ts`    | `api`         | making any HTTP call to the backend                      |
| `src/lib/format.ts` | `formatPrice` | displaying a VNĐ price value                             |
| `src/lib/utils.ts`  | `cn`          | merging Tailwind classes in a component with `className` |

> ⚠️ Whenever a new file is added to `src/lib/`, update this table immediately.
> ⚠️ Keep **Use when** to one short line — a few words of context is fine, but push edge cases, caveats, or "not implemented yet" notes into a note below the table instead of into the cell.

Note on `api.ts`: auth interceptors (attach access token, 401 → refresh → retry) are deliberately NOT implemented yet — blocked on the token storage decision (see Tech Stack → Undecided). Add them when building the auth module.

## Current Status

- Project scaffolded with `create-next-app` (TypeScript, Tailwind, ESLint, App Router, `src/`, `@/` alias, Turbopack): ✅ Done — `app/` moved into `src/`, `CLAUDE.md` redirects to this file
- Foundation setup: ✅ Done — `.env.local`/`.env.example` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`), axios instance (`src/lib/api.ts`), `formatPrice` util, Cloudinary + Google avatar whitelist in `next.config.ts`
- Docs: ✅ README.md
- Everything else: not started
- Decisions locked this round: shadcn/ui + lucide-react (moved to Confirmed), route group structure (see Project Structure)
- shadcn init: ✅ Done — Maia preset on Base UI; cleanup applied: `iconLibrary` → `lucide` in `components.json`, hugeicons packages removed, `shadcn` CLI moved to devDependencies, template fonts (Figtree/Geist — no Vietnamese support) replaced with a `vietnamese`-subset font, `lang="vi"` + Fleazo metadata in root layout
- Design System: ✅ Done — color tokens, typography (Manrope + Be Vietnam Pro), signature "tag treo" element documented above
- `globals.css`: ✅ Done — Fleazo brand tokens wired into shadcn semantic vars
- `Header` component (`src/components/layout/header.tsx`): ✅ Done — logo, search bar (placeholder, own full-width row on mobile so it isn't squeezed), guest-state actions (placeholder, not wired to real auth). Category browsing deliberately not in the header (a chip rail was tried and reverted — doesn't scale past a handful of categories) — will live on the home page instead. Ambient background (drifting blurred blobs + a repeating "tag treo" pattern, both via CSS/SVG, no image asset) and a shrink-on-scroll effect (padding + logo height step down) — this makes Header a Client Component, an intentional exception to the default-Server-Component rule (see Key Conventions → Rendering)
- `Footer` component (`src/components/layout/footer.tsx`): ✅ Done — minimal placeholder (logo, tagline, copyright), needs real columns later
- `(main)/layout.tsx`: ✅ Done — assembles Header + main + Footer
- Next: `(auth)` layout, home page skeleton

## Agent Behavior

After completing any meaningful unit of work (feature, fix, refactor, docs update), always provide a suggested commit message at the end of the response.

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:**

- `feat` — new feature
- `fix` — bug fix
- `chore` — config, tooling, dependencies (no logic change)
- `refactor` — code refactor, no new feature or bug fix
- `docs` — documentation changes only
- `test` — add or update tests
- `style` — formatting, lint (no logic change)

**Scope** — frontend module/area (optional but encouraged):
`auth`, `products`, `categories`, `chat`, `profile`, `reviews`, `payments`, `admin`, `ui`, `api`, `config`

**Examples:**

```
feat(auth): add login page with form validation
fix(products): handle empty image list on product card
chore(config): whitelist cloudinary domain in next.config
refactor(ui): extract price formatting into shared util
docs: update AGENTS.md with confirmed state management choice
```

**Rules:**

- Subject in English, imperative mood ("add" not "added")
- Do not capitalize the first letter of the subject
- No trailing period in subject
- Subject max 72 characters
