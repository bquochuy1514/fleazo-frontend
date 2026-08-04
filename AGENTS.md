# Fleazo Frontend v2 — AGENTS.md

> **This file is not going in the public repo** (portfolio project — recruiters get the
> code, not the diary). Source comments must never point here. When you touch code that
> has a comment referencing this file, delete that reference; keep the reasoning only if
> it's short and stated inline. New comments: short, in-code, no "see AGENTS.md".

> **Repo:** `fleazo-frontend-v2` — full rewrite of the customer-facing web app, replacing
> `fleazo-frontend` (kept around read-only for reference, not deleted).
> Backend is unchanged: `fleazo-backend` (NestJS + Prisma + PostgreSQL). **Read
> `fleazo-backend/AGENTS.md` for API contracts, WebSocket event contract, and domain
> design decisions** — this file does not duplicate them, only notes what the frontend
> must know.

## What belongs in this file

**Applies to every section below.** This file records **direction and current state** —
decisions a contributor could not derive by reading the code, plus what actually exists
today. It is not a changelog, not a design diary, and not a place to re-explain code
that already explains itself.

Write it down when it is:

- a product or domain decision plus the constraint behind it ("no cart exists, so the
  card's second action is Liên hệ, not Buy Now")
- a rule that binds future work ("search lives only in the header — don't add a second
  one to a hero")
- a trap in a tool or dependency that costs real time to rediscover
- where something lives, and what is or isn't built yet

Leave it out when it is:

- reasoning about one specific line of CSS or one magic number — that belongs in a
  comment beside the number, where it cannot drift out of sync
- measurements that expire the moment an asset changes (contrast ratios, pixel widths,
  colour stops tuned to one photo)
- "an earlier version did X" — history is in git
- anything obvious from opening the file being described

A bullet past ~4 lines has almost certainly become a diary entry. Cut it back to the
decision.

## Project Overview

Fleazo is a student secondhand marketplace platform built for Vietnamese university
students. Same product goals as `fleazo-backend` (real product + revenue-generating,
production quality always — see backend AGENTS.md → Project Overview). This repo is a
visual and structural reset of the frontend, not a backend change — every API
contract/data model decision documented in the backend's AGENTS.md still applies as-is.

## iOS Safari traps — read before building any overlay or input

**None of these reproduce in a desktop browser's device emulator.** Chrome DevTools'
responsive mode is still Blink; every item below is WebKit-only behaviour, so "it looks
right at 390px on the laptop" proves nothing about a phone. Each one here cost a
round-trip to a real device to find. **Test overlays and text fields on a real iPhone.**

- **Any focusable field must be ≥16px at every width below `md`.** iOS zooms the whole
  page in when a focused `input`/`textarea`/`select` has a smaller font size, and it does
  not zoom back out. Use `text-base md:text-sm` — never `text-sm` or `text-[15px]` as the
  base. `components/ui/input.tsx` already does this; hand-written fields must too.
  Non-focusable elements (buttons, list rows) are exempt — only fields trigger it.
- **A `position: fixed` overlay cannot live inside an element with a `backdrop-filter`.**
  A filter/backdrop-filter/transform makes that element the containing block for fixed
  descendants, so `inset-0` resolves against *it*, not the viewport. This is spec, not a
  bug, and it bites here because the header pill gains `backdrop-blur-md` the moment it
  leaves the hero — the search overlay silently collapsed to the pill's own 397×62 box.
  Portal such overlays to `<body>`.
- **A full-screen overlay must lock the page behind it** — `hooks/use-scroll-lock.ts`,
  which pins `<body>` and restores the offset. `overflow: hidden` alone does not stop
  touch scrolling on iOS, and iOS scrolls the *document* to reveal a focused field even
  when that field is inside a fixed overlay, walking the page toward the top a little on
  every open. Pair it with `focus({ preventScroll: true })`. Radix Dialog (our `Sheet`,
  and `Picker` through it) brings its own lock — this is only for hand-rolled overlays.
- **Cap a bottom sheet's height in `svh`, not `dvh`.** With the page scroll-locked iOS
  keeps the URL bar retracted, which is the state `dvh` resolves *larger* in, so a `dvh`
  cap can exceed the area actually on screen.
- **Don't size a scroll region by `flex-1` inside a container whose height comes from
  `max-height`.** Blink resolves the shrink against the cap; WebKit gives the item its
  full content height instead, and the panel grows past the viewport with its overflow
  never engaging — a sheet with nothing to scroll, running off the top of the screen.
  Put the `max-height` on the scroller itself.

## Tech Stack

- Framework: Next.js 16.2.12 (App Router, Turbopack), **root `app/`, no `src/` directory**
  (deliberate departure from `fleazo-frontend`) — `@/*` maps to project root.
- Language: TypeScript, strict
- Styling: Tailwind CSS v4
- UI components: **shadcn/ui on Radix Primitives** (`radix-ui` package), Nova preset —
  a deliberate departure from `fleazo-frontend`'s Base UI/Maia setup. No project-specific
  patches needed yet; if one is ever required (like `fleazo-frontend`'s hand-patched
  `dialog.tsx`/`dropdown-menu.tsx`), document it here immediately.
- Icons: **lucide-react** only — matches shadcn's `iconLibrary` config in
  `components.json`, don't add a second icon set.
- Package manager: npm
- HTTP client: axios (planned — not wired yet, no `lib/api.ts` exists)
- Realtime: `socket.io-client` (installed — backend uses Socket.IO, not raw WebSocket)
- Toast: sonner (installed, not yet mounted in root layout)
- Date manipulation: dayjs (installed, same as backend)
- `cn()` util: `lib/utils.ts` (shadcn-generated, `clsx` + `tailwind-merge`)

## Design System

Visual direction inspired by a monochrome editorial "shop" reference the user provided
(hero with an oversized cropped wordmark, sidebar category filter, product grid,
pill buttons) — but recolored away from stark black/white luxury minimalism toward
something that reads as a **student secondhand marketplace**, not a boutique storefront.
Evaluated against a "$10K website checklist" (point of view, restrained color system,
paired display+body type that isn't Inter/Roboto, imagery with intent, mobile designed
not shrunk) — treat those as standing quality bars for every page built here.

### Color tokens — "Moss Reuse" palette

Defined as CSS variables in `styles/globals.css`, consumed via Tailwind. **Never hardcode
these hex values anywhere else** — reference the tokens (`bg-fz-ink`, `text-fz-accent`,
etc.) or shadcn's semantic tokens (`bg-primary`, `bg-muted`, ...) instead.

| Token                 | Hex       | Role                                                             |
| --------------------- | --------- | ---------------------------------------------------------------- |
| `--color-ink`         | `#211F1C` | Primary text, solid CTA buttons (e.g. "Liên hệ")                 |
| `--color-paper`       | `#F6F3EE` | Page background                                                  |
| `--color-muted-warm`  | `#8B857A` | Secondary text, outline-button borders                           |
| `--color-border-warm` | `#E4E0D8` | Card/image-placeholder borders                                   |
| `--color-moss`        | `#5B6B4F` | **The one accent** — price tags, save/favorite active state only |
| `--color-moss-soft`   | `#E8ECE1` | Light moss tint (badges, hover fills)                            |
| `--color-rust`        | `#A8442E` | Errors/destructive only                                          |

Rule: `--color-moss` is deliberately **not** the color of the primary CTA button — the
main "Liên hệ"/contact-seller button is solid ink (high-contrast, matches the reference's
"Buy Now" black button). Moss is reserved for exactly two things: the price pill and the
save-button active state. Don't reach for it as a general-purpose accent — that's what
would turn this back into a rainbow palette the checklist above warns against.

shadcn's own semantic `--primary` maps to ink (not moss) for this reason — see
`styles/globals.css` comments.

### Typography

- Heading/display: **Space Grotesk** — distinctive
  squared-off grotesk, confirmed full Vietnamese diacritic support, not reused from
  `fleazo-frontend` (which used Manrope).
- Body: **Hanken Grotesk** — confirmed full Vietnamese diacritic support.
- Both loaded via `next/font/google` in `app/layout.tsx` with `subsets: ['latin', 'vietnamese']`
  — never reintroduce a font without the `vietnamese` subset explicitly listed, many
  trendy display faces silently drop Vietnamese diacritics.
- `--font-heading`/`--font-sans` CSS variables wired through `@theme inline` in
  `styles/globals.css` — use Tailwind's `font-heading`/`font-sans` utilities, don't
  reference the font names directly.

### Layout decisions (confirmed, not yet built)

- **Home (`/`)**: a lighter composition — hero + a few curated sections. Not the full
  browse layout below.
- **`/danh-muc` is the category directory.** It is a public, durable market directory:
  every root category has equal navigational status, independent of its current listing
  count. Homepage only teases four categories; `/tim-kiem` remains the listing-results
  route after a category or keyword is chosen.
- **Tìm kiếm** (planned route): the full reference composition — hero + sidebar category
  filter (2-level tree, matches `Category.parentId` hierarchy) + product grid +
  pagination.
- **Signed-out visitors are pushed to log in, deliberately, for anything identity-shaped**
  — `/quan-ly-tin`, `/tin-nhan`, `/dang-tin`, `/ca-nhan`. None of the four render anything
  meaningful without a session (a listings dashboard, a chat inbox, a post-a-listing form
  and a profile all need to know who's asking), so there's no guest-mode version worth
  building for them. `BottomNav` and the header's `Tin nhắn` icon link to these routes
  unconditionally — there is no auth state in the UI to branch on yet (see Current
  Status), so the redirect is the job of the planned `ProtectedGuard`/`proxy.ts`, not
  something hand-rolled per link. Two things make this a gate and not a wall: send the
  visitor back to what they tapped after login (`?next=`), not to the homepage; and the
  login screen should say why it's asking ("Đăng nhập để nhắn tin với người bán"), not
  present a bare form. Neither is built yet — the routes exist, the bounce doesn't.
- **Product card**: no per-product star rating (Fleazo reviews are seller-level only —
  see backend AGENTS.md → Reviews section, every listing sells once). Show a condition
  badge + location instead. Two actions: outline "Lưu tin" (save/favorite) + solid-ink
  "Liên hệ" (→ chat with seller) — **not** "Add to Chart"/"Buy Now", Fleazo has no
  cart/checkout (see backend AGENTS.md → Money Flow, trades happen off-platform).
- **Header**: cart icon from the reference → messages icon (mirrors `fleazo-frontend`'s
  `Header`/`UnreadBadge` pattern for the eventual unread count, not built yet — not a
  cart, no cart concept exists). Sits from `md` in its own `gap-4` cluster, separated
  from the Đăng nhập/Đăng tin pair (`gap-2` internally) rather than one evenly-spaced row
  of three — it's a standalone utility, not a third member of the auth/CTA group.
- **"Explore our recommendations" section** → renamed/reworked as **"Tin mới đăng"**
  (newest listings, chronological) — Fleazo has no recommendation engine, personalized or
  otherwise (see backend AGENTS.md → Listing Quality & AI Chatbot, dropped deliberately).
- **Footer CTA banner**: not a newsletter/email-capture form (no such backend feature
  exists) — reworked as a seller-acquisition CTA ("Có đồ không dùng nữa? Đăng tin ngay")
  linking to the post-listing flow.
- **Hero content sits in three tiers**: statement (eyebrow + `h1` + subcopy), then the
  action tier (category quick-pick chips), then a demoted footnote tier (the trust row,
  behind a hairline rule). The gaps *between* tiers are the hierarchy — spacing them
  evenly turns five blocks into five equal things. Exact values live in the JSX.
- **The hero's right side is deliberately empty** — the photo occupies it. Listing cards
  were built there and cut on purpose. Don't refill it without reversing that decision.
- **Header is a floating inset pill, not a full-bleed bar** — `fixed`, with side gutters,
  so the hero photo shows through around and behind it. Two consequences: the hero starts
  at viewport top, header included, and the header occupies **no flow space**, so any
  page without its own full-bleed hero must add top padding to clear it.
- **Search lives in the header on every page, hero included.** No second search pill in a
  hero — search is the marketplace's primary action and can't be the control that
  disappears on the screen everybody lands on. The hero's category chips are the
  alternative way in for someone who doesn't know what to type.
- **Hero photo is two art-directed crops, not one image stretched to fit every
  viewport** — `hero-image-mobile.png` (960×1600, 3:5) and `hero-image-desktop.png`
  (2400×1351, ~16:9), both `object-cover`, swapped with a CSS `orientation` media query
  (`[@media(orientation:landscape)]:hidden`/`:block`), never `object-contain` (letterboxes,
  exposes bare scrim bands — tried and rejected). One crop can't serve both ends: at a
  single 3:2 source, `cover` had to slice ~70% off the SIDES on a phone to fill its
  height, and any crop wide enough to look right on a wide desktop makes that phone crop
  worse, not better — the two needs pull in opposite directions as the source aspect
  changes, so a single file always loses on one end.
  **The swap is keyed on `orientation`, not a width breakpoint** — a portrait tablet
  (768px, same width as `md`) still needs the PORTRAIT crop, and any width-only cutover
  hands it the landscape one instead.
  **Both images carry `priority`, deliberately** — Next injects a `priority` image's
  preload `<link>` unconditionally, before CSS resolves which `hidden` applies, so there
  is no way to preload only the visible one short of hand-rolling the preload tag with
  its own `media` attribute. The extra request for the orientation not shown is an
  accepted cost, not an oversight.
  **Whenever the photo changes, re-cut BOTH crops from the new source** (mobile ~3:5,
  desktop ~16:9, subject low/mid-frame per `object-bottom`) and re-measure text contrast
  against both — the aspect ratios above are the load-bearing part of this rule; the
  exact pixel dimensions will drift with whatever source photo is current.
- **The hero's two scrims MULTIPLY** — combined coverage is `1−(1−a₁)(1−a₂)`, not
  `a₁+a₂`, which makes it very easy to end up with a photo nobody can see while every
  text element sits far above the contrast it needed. The horizontal one carries
  legibility and is breakpoint-dependent (a phone can't use the desktop falloff — text
  spans the full width there); the vertical one is mood only.
  **Whenever the photo changes, re-measure text contrast and retune both together.** The
  committed stops are tuned to the current photo and mean nothing for a different one.
  Measure against the glyph runs (`Range.getClientRects()`), not element boxes.
- **Logo is one PNG cropped into two halves** (`components/logo.tsx`): the source is a
  _stacked_ lockup, unusable at header height, so mark and wordmark are cropped out by
  mask percentages and re-laid out horizontally. **Re-measure those crop boxes if the
  PNG's internal layout changes.** Both halves are masked to `currentColor` — the lockup
  is monochrome by choice and inverts to white over the hero. Mark-only below `md`.
- **Hero motion lives in `styles/globals.css`** (`.fz-rise`, `.fz-drift`), not Tailwind's
  animation utilities. Keyframes start from the _hidden_ state so the
  `prefers-reduced-motion` branch only has to switch the animation off. Never invert that
  — an `opacity-0` base class leaves content invisible wherever the animation doesn't run.

Home, Header, and Footer are now built against these decisions — see Project Structure
and Current Status below for what's actually live.

- **Icons**: lucide-react (this version) ships **no brand/social icons** (`Facebook`,
  `Instagram`, etc. don't exist — it dropped logo marks). Footer's social row is plain
  text links, not icons — don't reach for a second icon package to fix this (violates
  the lucide-only rule) and don't hand-draw a brand mark as an SVG path (guessed logo
  paths risk misrepresenting the real mark).
- **`next/image` `quality` needs config allow-listing (Next 16)**: `images.qualities`
  defaults to `[75]` alone, and any `quality` prop not in that array is **silently
  coerced** to the nearest allowed value — no warning, no error, the srcset just comes
  back `q=75`. Add the value to `images.qualities` in `next.config.ts` (currently
  `[75, 90]`) whenever a new `quality` is used.
- **ISR on data-fetching pages**: axios isn't tracked by Next's `fetch` cache, so a page
  that calls `lib/products.ts`/`lib/categories.ts` and has no `dynamic`/`revalidate`
  export gets statically rendered **once at build time** and never sees new listings.
  `app/page.tsx` sets `export const revalidate = 60` for this reason — any other
  page reading live backend data needs the same (or `dynamic = 'force-dynamic'` if it
  must never serve stale data, e.g. a page reading auth state).

## Project Structure

```
app/                            # App Router — no src/ directory. Route groups are
├── layout.tsx                  #   live; see "Planned route-group structure" below for
│                               #   the full intended shape and the rules governing it.
│                               # Root layout: fonts, lang="vi", app-wide providers.
│                               #   Renders NO chrome — each group owns its own.
├── (auth)/layout.tsx           # Empty shells so far — the pages inside each of these
├── (bare)/layout.tsx           #   four groups are not built yet.
├── (header-only)/layout.tsx
└── (main)/
    ├── layout.tsx              # Header + main + Footer + BottomNav. Fetches provinces
    │                           #   once for the header. ⚠️ still holds a temporary
    │                           #   h-[1000px] scroll spacer — delete when Home grows
    │                           #   its real sections.
    ├── (protected)/layout.tsx  # Shell only — no ProtectedGuard yet, no pages
    └── (public)/page.tsx       # Home — photo hero only so far. `revalidate = 60`.

components/
├── ui/                  # shadcn-generated (Radix-based) — button, input, popover, sheet
│   └── picker.tsx       # ⚠️ hand-written, NOT from `shadcn add`. One control, two
│                        #   presentations: anchored popover from md, bottom sheet below
│                        #   it. Reach for this for every list-choice control — a popover
│                        #   on a phone puts a nested scroller at the far end of the
│                        #   thumb's reach.
├── logo.tsx             # Two masked crops of public/logo.png — see Layout decisions
├── layout/
│   ├── header.tsx       # Fixed floating pill — logo, always-on search, Tin nhắn +
│   │                    #   Đăng nhập + Đăng tin (md+), mobile account Sheet. Goes
│   │                    #   transparent over a hero via HERO_ROUTES + an
│   │                    #   IntersectionObserver.
│   ├── header-search.tsx#   Inline pill from md; a full-screen sheet below it
│   ├── location-picker.tsx# Province chip, shared by header search and its sheet
│   ├── bottom-nav.tsx   # Mobile-only tab bar (md:hidden) — desktop keeps the header CTA
│   └── footer.tsx       # Đăng-tin CTA band + link columns + copyright
├── home/                # Homepage-only sections: category shelf, latest listings,
│                        #   community banner and handoff steps.
├── listings/            # Reusable UI for a marketplace listing (card + save action).
├── listing-detail/      # Components owned by /san-pham/[id].
├── listing-form/        # Reusable controls for creating or editing a listing.
└── location/            # Location control shared by listing and profile forms.

hooks/
├── use-media-query.ts   # For the cases where both branches can't be in the DOM at once
│                        #   (Picker's popover/sheet split). Answers false on the server
│                        #   and through hydration — the false branch must be the
│                        #   server-renderable one.
└── use-scroll-lock.ts   # Freezes + restores the page behind a hand-rolled overlay
                         #   (see iOS Safari traps)

lib/
├── utils.ts             # cn() — shadcn class-merge util
├── api.ts               # Shared axios instance — interceptors, parseApiError,
│                        #   getStoredAccessToken, registerAuthFailureHandler (ported
│                        #   from fleazo-frontend, same backend contract, unchanged)
├── categories.ts        # getCategories()
├── products.ts          # getProducts, firstImageUrl, locationLabel
├── locations.ts         # getProvinces() — third-party list, no backend endpoint exists
├── province-store.ts    # Client store backing the location picker
└── format.ts            # formatPrice

types/
├── api.types.ts          # ApiErrorResponse<TFields>
├── category.types.ts     # Category
└── product.types.ts      # Product (trimmed to what findAll returns — no `seller`,
                          #   that only exists on findOne)

styles/
└── globals.css         # Tailwind entry + brand/shadcn CSS variables + the hero's
                        #   .fz-rise/.fz-drift keyframes. Imported by the root layout as
                        #   `@/styles/globals.css`. ⚠️ components.json "tailwind.css"
                        #   must point here or `shadcn add` breaks.

components.json          # shadcn CLI config (style: radix-nova, iconLibrary: lucide)
public/
├── logo.png             # Stacked lockup — cropped in two by components/logo.tsx
└── <hero photo>         # Homepage hero, user-supplied and swapped often. Re-measure
                         #   contrast on every swap (Layout decisions → hero scrims).
```

`providers/` doesn't exist yet — create only when the first real need shows up
(matches `fleazo-frontend`'s "no empty placeholder folders" rule), not preemptively. No
`AuthProvider`/`useAuth` yet either — Header/ListingCard are built for a guest viewer
only; wire real auth state in before adding anything that needs a logged-in user.

### Component ownership

- Components used only by one route live in that route's private `_components/` folder.
  `/quan-ly-tin/_components` owns its rows, tabs, status badge, and skeleton.
- `components/listings` is for reusable listing UI; `listing-detail` and `listing-form`
  are page/task-specific feature groups. Do not recreate a broad `components/products`
  catch-all folder.

> ⚠️ Keep this tree in sync whenever a folder is added or moved under the project root.

### Planned route-group structure

**Agreed direction, not yet built — don't start this until it's actually asked for.**
v2 will adopt the same route-group split `fleazo-frontend` uses, since the chrome
requirements are identical (auth screens want no marketplace nav, task flows want less
of it). Ported as-is except for the `src/` difference noted below.

```
proxy.ts                          # (planned) Route guards — cookie-flag optimistic
                                  #   redirect at the edge. ⚠️ Must sit at the PROJECT
                                  #   ROOT here, level with `app/` — NOT in a `src/`
                                  #   folder like fleazo-frontend, which v2 doesn't have.
                                  #   Next 16 renamed the `middleware.ts` convention to
                                  #   `proxy.ts` (exported fn `middleware` → `proxy`).
app/
├── layout.tsx                    # Root layout: <html>/<body>, fonts, lang="vi",
│                                 #   app-wide providers — and NO Header/Footer once the
│                                 #   groups below land (see Migration note).
├── not-found.tsx                 # (planned) Global 404
│
├── (auth)/                       # (planned) Login/register/OTP screens — no marketplace
│   │                             #   header/footer at all, wraps children in
│   │                             #   GuestOnlyGuard
│   ├── dang-nhap/ dang-ky/ xac-thuc-tai-khoan/
│   ├── quen-mat-khau/ xac-thuc-otp-quen-mat-khau/ dat-lai-mat-khau/
│   └── google-callback/          #   kept in English — it's the Google OAuth redirect
│                                 #   target, renaming means re-syncing the Authorized
│                                 #   redirect URIs in Google Cloud Console
│
├── (main)/                       # (planned) Marketplace shell — FULL chrome
│   ├── layout.tsx                #   <Header/> + <main> + <Footer/> + <BottomNav/>
│   ├── (public)/                 #   Anyone can view — SEO matters here
│   │   ├── page.tsx              #     Home (moves here from app/page.tsx)
│   │   ├── san-pham/[id]/        #     Product detail (ACTIVE-only)
│   │   └── tim-kiem/             #     Search + category filter — the full reference
│   │                             #     layout. No sibling danh-muc/ — see Layout
│   │                             #     decisions for why
│   └── (protected)/              #   Login required, still wants full chrome
│       ├── layout.tsx            #     Wraps children in ProtectedGuard — written ONCE
│       │                         #     here, never re-checked per page
│       ├── ca-nhan/              #     My profile
│       └── quan-ly-tin/          #     Seller's own listings
│
├── (header-only)/                # (planned) Sibling of (main) — Header only, no
│   │                             #   Footer/BottomNav. Focused logged-in task flows
│   │                             #   where marketplace nav still aids wayfinding.
│   ├── dang-tin/                 #   Post/edit a listing
│   └── tin-nhan/                 #   Chat — needs its own locked-scroll message pane
│
└── (bare)/                       # (planned) No chrome at all. Short, focused,
                                  #   logged-in-only flows.
```

Rules (same as `fleazo-frontend`, they earned these the hard way):

- **Which group a page belongs in is two independent decisions.** `(public)` vs
  `(protected)` is an _auth_ decision; `(main)` vs `(header-only)` vs `(bare)` is a
  _how much chrome_ decision. Watch for near-duplicates: a seller's public profile is
  public, "my profile" (editable) is protected — two different pages.
- **Every page under `(main)` goes in `(public)` or `(protected)`** — none directly in
  `(main)/`.
- **`(main)/layout.tsx` renders Header/Footer/BottomNav unconditionally.** A layout
  nested deeper _cannot_ un-render them, so a page needing less chrome must live outside
  the `(main)` tree entirely — that's the whole reason `(header-only)`/`(bare)` are
  siblings of `(main)` rather than nested inside it.
- **Guard logic lives once in `ProtectedGuard`**, never re-checked per page. Each of
  `(main)/(protected)`, `(header-only)`, `(bare)` just wraps `children` in it.
- **Add every new protected page to `proxy.ts`'s `PROTECTED_PATHS`** as it's built,
  whichever group it's in.
- Route groups `(...)` never appear in the URL — they exist purely to give each area its
  own `layout.tsx`.

The four group layouts and `BottomNav` exist; the pages inside them do not, and neither
do `proxy.ts` or `ProtectedGuard`. Chrome already lives in `(main)/layout.tsx` rather
than the root, so `(auth)` and `(bare)` can render none of it.

## Environment Variables

```
# ===========================
# Backend API
# ===========================
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

Same backend, same values `fleazo-frontend` used — `.env.local` (gitignored) and
`.env.example` both already set. Every new var needs the `NEXT_PUBLIC_` prefix to be
readable client-side, grouped under a named `# ===` section, added to both files.

## Key Conventions

- **Import alias:** `@/` absolute imports, mapped to project root (not `src/`).
- **User-facing text:** Vietnamese.
- **Code comments:** English, same as backend/`fleazo-frontend`. Default to no comment —
  only add one when the code would genuinely confuse someone without it. Never write
  "see AGENTS.md" in a code comment (see backend AGENTS.md → Code comments for why).
- **Rendering:** default to Server Components. Only add `"use client"` to the specific
  leaf that needs interactivity — same rule as `fleazo-frontend`.

## Current Status

- ✅ Done — project scaffold (`create-next-app@16.2.12`, root `app/`, `@/` alias, Turbopack)
- ✅ Done — shadcn/ui init (Radix Nova preset, lucide icons, `cn()` util)
- ✅ Done — core deps installed (axios, socket.io-client, sonner, dayjs)
- ✅ Done — Moss Reuse design tokens in `styles/globals.css`, Space Grotesk/Hanken
  Grotesk wired in root layout
- ✅ Done — env vars + Cloudinary image whitelist in `next.config.ts`
- ✅ Done — `lib/api.ts` (axios instance + interceptors, ported unchanged) and the
  `lib/`+`types/` helpers Home needs (`categories`, `products`, `format`)
- ✅ Done — route-group split: `(auth)`/`(main)`/`(header-only)`/`(bare)` layouts exist,
  chrome moved out of the root layout into `(main)/layout.tsx`
- ✅ Done — `Header` (floating pill, always-on search, province picker), `BottomNav`,
  `Footer`, `Logo`, `ListingCard`
- ✅ Done — Home hero: photo + three content tiers + category chips from live data,
  measured for AA contrast at 375/1280/1920
- 🚧 Home is **hero only** — the category grid and "Tin mới đăng" sections are agreed
  (see Layout decisions) but not built. `ListingCard` is therefore unused so far.
- 📋 Not started — every page inside the four route groups, `proxy.ts` guards,
  `ProtectedGuard`, and auth state in the UI. Don't begin unasked.
- ⚠️ Known debt — a temporary `h-[1000px]` spacer in `(main)/layout.tsx`; the hero's
  scroll cue and category chips link to routes that don't exist yet; no `openGraph`
  metadata (deliberately deferred).

## Agent Behavior

After completing any meaningful unit of work (feature, fix, refactor, docs update),
always provide a suggested commit message at the end of the response.

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`
**Scope:** frontend area (optional) — `auth`, `products`, `categories`, `chat`,
`profile`, `ui`, `api`, `config`

**Rules:** subject in English, imperative mood, no capital first letter, no trailing
period, max 72 characters.
