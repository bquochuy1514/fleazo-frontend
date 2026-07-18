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
- UI components: **shadcn/ui** — components are copied into the repo (`src/components/ui/`), owned and freely modifiable, not a dependency. Initialized with the **Maia** preset (soft, rounded, consumer-facing) on **Base UI** primitives (`@base-ui/react` — NOT Radix; imports in generated components come from `@base-ui/react/*`). CLI config lives in `components.json`.
- Icons: **lucide-react** — sole icon library (do not add react-icons, hugeicons, or any second icon set)
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

### Color tokens

Colors sampled pixel-exact from a reference mockup the user provided, not designed from scratch.

Define as CSS variables in `globals.css`, consume via Tailwind — never hardcode hex in components.

| Token                  | Hex       | Role                                     |
| ---------------------- | --------- | ---------------------------------------- |
| `--color-ink`          | `#1C2620` | Primary text                             |
| `--color-base`         | `#F3F6F4` | Page background                          |
| `--color-primary`      | `#03AA5C` | Brand — logo, links, icons               |
| `--color-primary-soft` | `#D7F3E8` | Light fill — placeholders, hover         |
| `--color-accent`       | `#00B380` | CTA — buttons, price tags                |
| `--color-danger`       | `#B5533C` | Errors, `REJECTED`/`BANNED` only         |
| `--color-dark-surface` | `#111828` | Dark navy surface — Header + Footer only |

Notes:

- `--color-base`: currently `#F3F6F4` — a cool, faintly sage-tinted near-white. Chosen deliberately over a warm cream tone (which reads as a generic "AI-default" background, see Frontend design philosophy below) — ties to the brand's teal identity instead.
- `--color-primary` and `--color-accent` are both teal, close in hue. **Don't eyeball-swap them** — always copy the exact hex/token, never approximate one from memory of the other.
- ⚠️ Contrast checked: white text on either teal fails WCAG AA for normal text (~2.7–3:1). `--primary-foreground` and `--secondary-foreground` in `globals.css` use `--color-ink`, not white — don't "fix" this back to white, it was a deliberate correction.
- `--color-dark-surface`: shared by `Header` and `Footer` background bars only — not a general-purpose token, don't reuse for cards/badges/or other surfaces. (Renamed from `--color-header-bg` once Footer adopted the same navy for visual bookend consistency.)
- `--color-danger`: never reused for `SOLD` — that's neutral-good, use `--color-ink` at low opacity overlay instead.

Rule: primary (darker teal, `#03AA5C`) = brand/identity, accent (brighter teal, `#00B380`) = action/money. They read as nearly the same color at a glance — the separation lives in the exact hex, not a visual hue gap.

### Typography

- Display (headings, price display): **Manrope** — variable weight, geometric, distinct from body without clashing
- Body: **Be Vietnam Pro**
- Both loaded with the `vietnamese` subset (see `src/app/layout.tsx`) — never reintroduce a font without it.
- Prices and any tabular numbers: `font-variant-numeric: tabular-nums`

### Signature element — "tag treo"

Recurring visual motif referencing a physical price tag: small rounded-rect badge, used consistently for:

- Product condition badge (`NEW`/`LIKE_NEW`/`GOOD`/`FAIR`/`POOR`) — color scales from `--color-primary-soft` (new) toward a neutral gray (poor), never random per-condition colors.
- Price tag overlay on product images
- Status badge (`SOLD` etc.)

### Dark surface (Header + Footer)

`Header` and `Footer` both use `--color-dark-surface` (dark navy, `#111828`) as a solid background bar, not `--background` — a deliberate exception, giving the page a matching navy "bookend" top and bottom. This token is exclusive to these two components; don't reuse it for cards/badges/other surfaces. All children of either component are styled explicitly for a dark surface (white/light text and icons) — don't default them to shadcn's `text-foreground`, which assumes a light page background.

The logo asset works directly on this navy bar — contrast measured ~7.3:1 (green wordmark vs `#111828`), passes WCAG AAA. The real logo (`Logo` component, `src/components/logo.tsx`) is used in both Header and Footer on this surface.

Tagline decided: **"The student swap marketplace"** (not yet placed anywhere in code — use when a hero/marketing copy slot is built).

### Frontend design philosophy

> Merged in from the old `frontend-design` skill folder — apply this mindset whenever building or reshaping any UI, not just once at project start.

Approach every new UI piece like a design lead who gives each brief a distinct identity — never settle for the generic Tailwind/shadcn-default look. Concretely:

- **Ground it in the subject.** Design choices (color, type, layout, motion) should come from Fleazo's actual world — secondhand student marketplace, Vietnamese campus life — not generic e-commerce tropes.
- **Avoid the 3 AI-design clichés** unless the brief specifically calls for one: (1) warm cream bg + high-contrast serif + terracotta accent, (2) near-black bg + one neon/vermilion accent, (3) broadsheet newspaper style with hairline rules and zero border-radius.
- **One signature element per surface**, kept restrained everywhere else — Fleazo's is the "tag treo" (price-tag) motif (see above). Don't add a second competing signature.
- **Structure must encode meaning** — don't add numbered steps (01/02/03), dividers, or eyebrows unless the content is genuinely sequential/categorized.
- **Motion is deliberate, not decorative** — plain Tailwind hover/active only (see Interactive feedback below); no animation library. Prefer one well-chosen motion cue per element over stacking several (e.g. don't combine scale + translate + shadow all at once).
- **Copy is design material** — user-facing text (Vietnamese) should be active-voice, specific, and consistent (a button labeled "Đăng tin" always results in a toast that says "Đã đăng tin", never a different verb).
- **Self-critique before shipping:** does this look like the default answer to any similar brief? If yes, revise. Check responsive behavior down to mobile and visible focus states every time.

### Component conventions

- `<StatusBadge status="..." />` — single shared component mapping every `ProductStatus`/`ProductCondition` enum value to its color; never write ad-hoc badge markup or hardcoded status colors per page
- Product card is one shared component reused across home, category, search, saved, seller-profile — no per-page duplicates
- Spacing between page sections uses a shared token/util (e.g. `--section-gap`), not repeated raw Tailwind spacing classes copy-pasted per page
- Radius: reuse shadcn's `--radius` scale for controls; cards get `12px` explicitly
- **Button gradients:** `default` variant uses `--color-accent-deep → --color-accent-bright` (= Tailwind's `emerald-500`/`teal-600` hex, kept as tokens rather than hardcoded Tailwind color classes), darkening to `*-hover` tokens (`emerald-600`/`teal-700`) on hover, plus `shadow-fz-accent-deep/20` and `hover:scale-[1.02]`. ⚠️ White text on this pair measures ~2.5–3.7:1 — below WCAG AA (4.5:1). This was flagged and explicitly accepted by the user (aesthetic match to a reference design over strict AA) — don't silently "fix" it back to a higher-contrast pair. `secondary` variant is unchanged — lighter `--color-primary → --color-primary-soft` pair with ink text.
- **Interactive feedback:** every clickable element gets a `hover`/`active` cue — no exceptions, no silent opt-outs. Buttons: hover is color/shadow-only per variant (see `button.tsx`); `active:scale-95` is on the shared base class, so every button — any variant, any size — gets the same uniform press feedback. `Logo` is an intentional exception — `hover:opacity-80`, no scale — because scaling a wide horizontal wordmark+icon lockup distorts it and risks overlapping neighboring header elements; opacity is the standard hover cue for logos generally. Plain CSS/Tailwind, not Framer Motion — no animation library is in the stack, and none is needed for scale/opacity-level feedback like this. Only reconsider Framer Motion if a genuinely complex interaction comes up (e.g. the mega menu's open/close transition, exit animations, drag gestures).

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
│   └── layout/                   # App shell components: header.tsx, footer.tsx, search-input.tsx, bottom-nav.tsx
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
- **Code comments:** English, same as backend. Keep them **short, tag-style**, placed directly above the element/line they describe — `// Logo: only works on dark surfaces for now` above `<Logo />`, not a multi-line paragraph block. One line per note; if a decision genuinely needs more context, put the detail here in AGENTS.md and leave just a pointer comment in code (`// see AGENTS.md → Header surface`).
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

> Rule: only the item(s) actively being worked on get a detailed line. Once something is finished, collapse it to one line — `✅ Done — <shortest possible summary>`. Don't let finished work accumulate long descriptions here; if a decision still matters going forward, its detail belongs in the relevant section above (Tech Stack, Design System, Project Structure), not here.

- ✅ Done — project scaffold (`create-next-app`, `src/`, `@/` alias, Turbopack)
- ✅ Done — foundation (`.env` files, axios instance, `formatPrice`, Cloudinary/Google whitelist)
- ✅ Done — shadcn/ui init (Maia + Base UI, lucide icons, vietnamese-subset fonts)
- ✅ Done — design system (color tokens, typography, "tag treo" signature)
- ✅ Done — `globals.css` brand tokens
- ✅ Done — `Header`, `Footer`, `(main)/layout.tsx` (placeholder content, not wired to real data/auth yet; category browsing moved out of header, will live on home page instead)
- ✅ Done — README

**Next:** `(auth)` layout, home page skeleton

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
