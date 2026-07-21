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
- Form handling: **no library** — reconsidered after building the login UI. `react-hook-form + zod` was tried first, then removed: client-side validation only catches "obviously wrong" input before a network call (empty field, malformed email) — it never replaces backend validation, which must re-check everything regardless. Current approach: uncontrolled inputs + native HTML5 types, backend errors surfaced per-field on submit — see **Form Conventions** section for the full pattern and shared building blocks. react-hook-form + zod remain the fallback choice if a form gets genuinely complex (multi-step, many cross-field rules), not ruled out permanently.
- Token storage: **localStorage vs sessionStorage, decided by the user's "remember me" choice** — checked → both `access_token` and `refresh_token` in `localStorage` (survives browser close, enables silent refresh); unchecked → only `access_token` in `sessionStorage`, no `refresh_token` stored at all (session just ends when the access token expires or the tab closes). Not an httpOnly-cookie approach — plain client storage either way.
- Client-state management: **React Context, not Zustand** — for auth state specifically. Auth is a single object that changes rarely (login/logout); Zustand's value (multiple stores, selectors to avoid re-renders, middleware) doesn't pay off for that. Not a blanket rejection of Zustand — reconsider per area if something with genuinely complex, frequently-changing state shows up (cart, filters) later.

### Undecided — decide incrementally as each area is built, then move to Confirmed

- Server-state management (TanStack Query?) — decide when building the first data-fetching page
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

### Dark surface

`--color-dark-surface` (dark navy, `#111828`) is used as a full-bleed background wherever the white logo wordmark needs a dark backdrop to sit on — currently `Header`, `Footer`, the `(auth)` split-layout dark panel, and the global 404 page, all via `DarkSurfaceAmbient` (`src/components/layout/dark-surface-ambient.tsx`). Still not a general-purpose surface — don't reuse it for cards/badges/other small UI surfaces, only for these full-bleed "logo needs to sit on dark" contexts. All children on this surface are styled explicitly for it (white/light text and icons) — don't default them to shadcn's `text-foreground`, which assumes a light page background.

The logo asset works directly on this navy bar — contrast measured ~7.3:1 (green wordmark vs `#111828`), passes WCAG AAA.

Tagline decided: **"The student swap marketplace"** — placed in the `(auth)` layout's desktop panel.

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
- `(auth)` pages use a split layout — dark brand panel (Logo + value props) on the left, form on the right; collapses to a compact top strip on mobile. See `(auth)/layout.tsx` comments. Content added deliberately (real value props, not decorative filler) per Frontend design philosophy.
- **Button gradients:** `default` variant uses `--color-accent-deep → --color-accent-bright` (= Tailwind's `emerald-500`/`teal-600` hex, kept as tokens rather than hardcoded Tailwind color classes), darkening to `*-hover` tokens (`emerald-600`/`teal-700`) plus a stronger shadow (`shadow-md` → `shadow-lg`, both `shadow-fz-accent-deep/*`) on hover — no scale transform (see Interactive feedback below). ⚠️ White text on this pair measures ~2.5–3.7:1 — below WCAG AA (4.5:1). This was flagged and explicitly accepted by the user (aesthetic match to a reference design over strict AA) — don't silently "fix" it back to a higher-contrast pair. `secondary` variant is unchanged — lighter `--color-primary → --color-primary-soft` pair with ink text.
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
│   ├── layout/                   # App shell components: header.tsx, footer.tsx,
│   │                             #   search-input.tsx, bottom-nav.tsx,
│   │                             #   dark-surface-ambient.tsx
│   ├── auth/                     # Shared by (auth) pages: google-auth-button.tsx
│   └── form/                     # Shared form building blocks (see Form Conventions):
│                                 #   field-error.tsx, password-input.tsx,
│                                 #   action-banner.tsx
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
├── hooks/                        # (planned) shared hooks (useAuth still pending, useSocket...)
├── types/
│   ├── api.types.ts              # ApiErrorResponse<TFields> — shared axios error-response
│   │                             #   shape (message/errorCode/errors), see Form Conventions
│   └── user.types.ts             # User — full GET /users/profile shape, reused anywhere
│                                 #   a user entity is shown (not auth-specific)
└── providers/
    └── auth-provider.tsx         # AuthContext + AuthProvider — see Auth Flow → Client auth state

components.json                   # shadcn CLI config — read by the CLI, not by app code
public/                           # Static assets served as-is
```

Route groups `(...)` never appear in the URL — they exist only to give each area its own `layout.tsx`. `admin/` (own sidebar layout) is planned but not designed yet.

Rules:

- **Every page** under `(main)` lives in either `(public)` or `(protected)` — no pages directly in `(main)/`. Public **viewing** pages → `(public)`; logged-in **action** pages → `(protected)`. Careful with near-duplicates: seller public profile = public, "my profile" (editing) = protected — two different pages.
- Auth guard logic lives once in `(main)/(protected)/layout.tsx` — never re-check per page.
- Chat will live under `(main)/(protected)` but needs a full-viewport-height layout (hide footer, lock height) — design that when building chat, do not hardcode the footer somewhere hard to remove.

> ⚠️ Keep this tree in sync whenever a folder is added or moved under `src/`.

## Form Conventions

> Decided after building the login form — see Tech Stack → Form handling for why no form library.

- **Form values (email, password, etc.): uncontrolled inputs**, read once on submit via `Object.fromEntries(new FormData(e.currentTarget))` — no `useState` per field. The resulting plain object is still sent as a normal JSON body (axios serializes plain objects automatically); `FormData` here is only a DOM-reading convenience, never the wire format, never multipart.
- **UI-only state is a different category — always `useState`, regardless of the rule above**: loading flags, modal open/close, password show/hide, and anything else that isn't a value submitted to the backend.
- **A field that isn't sent to the backend but changes client behavior (e.g. `rememberMe`) is also `useState`, kept out of the `FormData` read entirely** — don't let it ride along in `values` just because it's inside the same `<form>`; it's not a DTO field and a strict backend DTO (`forbidNonWhitelisted`) would reject it if submitted as-is.
- **Error shape**: `ApiErrorResponse<TFields>` in `src/types/api.types.ts` — `{ message?: string; errorCode?: string; errors?: Partial<Record<TFields, string>> }`. Parse a caught axios error with `parseApiError<TFields>(err)` from `src/lib/api.ts` — never call `isAxiosError` by hand per page, and never declare a one-off error type. `parseApiError` returns the full shape (including `errorCode`) so callers can branch on it directly from the return value, not by reading state right back — `setErrors` isn't synchronous.
- **Field-level error display**: `<FieldError message={...} />` from `src/components/form/field-error.tsx` — shared across every form, don't hand-roll the `{error && <p className="...">}` pattern per page.
- **Password fields with a show/hide toggle**: `<PasswordInput />` from `src/components/form/password-input.tsx` — owns its own toggle state internally, used exactly like `Input` (accepts a separate `wrapperClassName` for margin on the outer wrapper, since it renders two elements — the input and the toggle button — not one).
- **A backend message paired with a suggested next step** (verify now, log in now, ...): `<ActionBanner message={...} actionHref={...} actionLabel={...} />` from `src/components/form/action-banner.tsx` — `actionHref`/`actionLabel` are optional for a plain message banner with no link. Always pass the backend's real `message`, never a hardcoded string, even though the action itself is branched via `errorCode`.
- Escalate to react-hook-form + zod only when a form is genuinely complex (multi-step, many cross-field rules) — not needed anywhere yet.

## Client Auth State

- `AuthContext`/`AuthProvider` in `src/providers/auth-provider.tsx` — plain React Context, not Zustand (see Tech Stack → Confirmed for why). Holds `user: User | null` and `isLoading`; exposes `login(accessToken)` and `logout()`.
- **`login(accessToken)` does not perform a login.** Auth pages (`login/page.tsx`) already own the entire login flow — calling `/auth/login`, the remember-me storage split, redirecting. This function only runs _after_ a valid token already exists in storage: it fetches `/users/profile` with that token and sets `user`. Call it right after the page's own token-storage step, right before `router.push`.
- No axios interceptor for this — the token is attached by hand on the one `/users/profile` call. An interceptor (auto-attach token everywhere + 401 → refresh → retry) becomes worth building once many more endpoints need it; not the case yet with a single call site.
- `fetchProfile` never throws to its caller — any failure (expired/invalid token, network error) resolves to `null`, meaning "not logged in". Callers don't need a second try/catch.
- `children` are never hidden behind a loading gate (no `{!isLoading && children}`) — components that care (e.g. Header) read `isLoading` themselves and own their own loading UI.

## Key Conventions

- **Import alias:** use `@/` absolute imports (Next.js default) — a deliberate departure from the backend's relative-imports rule. Frontend trees nest deeper and the Next ecosystem assumes `@/`.
- **User-facing text:** Vietnamese. Form validation messages mirror the backend DTO messages (Vietnamese) where the same field exists.
- **Code comments:** English, same as backend. Keep them **short, tag-style**, placed directly above the element/line they describe — `// Logo: only works on dark surfaces for now` above `<Logo />`, not a multi-line paragraph block. One line per note; if a decision genuinely needs more context, put the detail here in AGENTS.md and leave just a pointer comment in code (`// see AGENTS.md → Header surface`). Comments document **project decisions**, never the AI's own reasoning/uncertainty process while writing the code — no "inferred from X", "wasn't shared so double-check", "assuming Y based on Z". If something is genuinely unconfirmed, say so once in chat, not as a permanent comment baked into the file.
- **HTTP calls:** all requests go through the shared axios instance in `src/lib/api.ts` — never import `axios` directly in components/pages.
- **Env vars:** `NEXT_PUBLIC_` prefix required for any variable read on the client. Grouped into named sections with `# ===========================` dividers (same as backend). Every new var must also be added to `.env.example`.
- Date manipulation: `dayjs` (same as backend)
- **Rendering:** default to Server Components (no `"use client"`). Only add `"use client"` to the specific component that needs interactivity (state, event handlers, browser APIs, TanStack Query hooks) — not to whole pages or layouts. `(public)` pages especially should stay server-rendered for SEO; push client-only logic into small leaf components. Exception: `Header` (`src/components/layout/header.tsx`) is itself a Client Component because its shrink-on-scroll effect needs `window.scrollY` — the interactivity belongs to the whole component, not a nested leaf, so it's the component that's client, not its callers. `(main)/layout.tsx` and every page importing it stay Server Components.
- ⚠️ Whenever a new shared util/component/hook pattern is established, document it in this file immediately.

## Common Utilities & Shared Components

Always check for existing utilities before writing new code:

| Path                                     | Export                      | Use when                                                    |
| ---------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| `src/lib/api.ts`                         | `api`, `parseApiError`      | HTTP calls; parsing a caught error                          |
| `src/lib/format.ts`                      | `formatPrice`               | displaying a VNĐ price value                                |
| `src/lib/utils.ts`                       | `cn`                        | merging Tailwind classes in a component with `className`    |
| `src/types/api.types.ts`                 | `ApiErrorResponse<TFields>` | typing an axios error response for any form                 |
| `src/types/user.types.ts`                | `User`                      | typing a user entity anywhere it's displayed                |
| `src/components/form/field-error.tsx`    | `FieldError`                | rendering a field-level error message under an input        |
| `src/components/form/password-input.tsx` | `PasswordInput`             | a password field that needs a show/hide toggle              |
| `src/components/form/action-banner.tsx`  | `ActionBanner`              | showing a backend message with an optional suggested action |

> ⚠️ Whenever a new file is added to `src/lib/`, `src/types/`, or `src/components/form/`, update this table immediately.
> ⚠️ Keep **Use when** to one short line — a few words of context is fine, but push edge cases, caveats, or "not implemented yet" notes into a note below the table instead of into the cell.

Note on `api.ts`: auth interceptors (attach access token, 401 → refresh → retry) are deliberately NOT implemented yet — the token storage side of this is now decided (see Tech Stack → Token storage), interceptor logic itself still isn't built. Add it when building out the rest of the auth module.

## Current Status

> Rule: only the item(s) actively being worked on get a detailed line. Once something is finished, collapse it to one line — `✅ Done — <shortest possible summary>`. Don't let finished work accumulate long descriptions here; if a decision still matters going forward, its detail belongs in the relevant section above (Tech Stack, Design System, Project Structure), not here.

- ✅ Done — project scaffold (`create-next-app`, `src/`, `@/` alias, Turbopack)
- ✅ Done — foundation (`.env` files, axios instance, `formatPrice`, Cloudinary/Google whitelist)
- ✅ Done — shadcn/ui init (Maia + Base UI, lucide icons, vietnamese-subset fonts)
- ✅ Done — design system (color tokens, typography, "tag treo" signature)
- ✅ Done — `globals.css` brand tokens
- ✅ Done — `Header`, `Footer`, `BottomNav`, `(main)/layout.tsx` (placeholder content, not wired to real data/auth yet; category browsing moved out of header, will live on home page instead)
- ✅ Done — `(auth)` layout (split brand/form panels, bottom-sheet card on mobile) + `login` page (uncontrolled form + `FieldError`/`PasswordInput` shared components — see Form Conventions; remember-me, Google button placeholder)

**Next:** `register`/`forgot-password`/`reset-password`/`verify-account` pages, home page skeleton

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
