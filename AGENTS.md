# Fleazo Frontend v2 — AGENTS.md

> **Repo:** `fleazo-frontend-v2` — full rewrite of the customer-facing web app, replacing
> `fleazo-frontend` (kept around read-only for reference, not deleted).
> Backend is unchanged: `fleazo-backend` (NestJS + Prisma + PostgreSQL). **Read
> `fleazo-backend/AGENTS.md` for API contracts, WebSocket event contract, and domain
> design decisions** — this file does not duplicate them, only notes what the frontend
> must know.

## Project Overview

Fleazo is a student secondhand marketplace platform built for Vietnamese university
students. Same product goals as `fleazo-backend` (real product + revenue-generating,
production quality always — see backend AGENTS.md → Project Overview). This repo is a
visual and structural reset of the frontend, not a backend change — every API
contract/data model decision documented in the backend's AGENTS.md still applies as-is.

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

| Token                  | Hex       | Role                                              |
| ----------------------- | --------- | ------------------------------------------------- |
| `--color-ink`          | `#211F1C` | Primary text, solid CTA buttons (e.g. "Liên hệ")  |
| `--color-paper`        | `#F6F3EE` | Page background                                    |
| `--color-muted-warm`   | `#8B857A` | Secondary text, outline-button borders             |
| `--color-border-warm`  | `#E4E0D8` | Card/image-placeholder borders                     |
| `--color-moss`         | `#5B6B4F` | **The one accent** — price tags, save/favorite active state only |
| `--color-moss-soft`    | `#E8ECE1` | Light moss tint (badges, hover fills)              |
| `--color-rust`         | `#A8442E` | Errors/destructive only                            |

Rule: `--color-moss` is deliberately **not** the color of the primary CTA button — the
main "Liên hệ"/contact-seller button is solid ink (high-contrast, matches the reference's
"Buy Now" black button). Moss is reserved for exactly two things: the price pill and the
save-button active state. Don't reach for it as a general-purpose accent — that's what
would turn this back into a rainbow palette the checklist above warns against.

shadcn's own semantic `--primary` maps to ink (not moss) for this reason — see
`styles/globals.css` comments.

### Typography

- Heading/display (including the oversized hero wordmark): **Space Grotesk** — distinctive
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
- **Danh mục / Tìm kiếm** (planned routes): the full reference composition — hero +
  sidebar category filter (2-level tree, matches `Category.parentId` hierarchy) + product
  grid + pagination.
- **Product card**: no per-product star rating (Fleazo reviews are seller-level only —
  see backend AGENTS.md → Reviews section, every listing sells once). Show a condition
  badge + location instead. Two actions: outline "Lưu tin" (save/favorite) + solid-ink
  "Liên hệ" (→ chat with seller) — **not** "Add to Chart"/"Buy Now", Fleazo has no
  cart/checkout (see backend AGENTS.md → Money Flow, trades happen off-platform).
- **Header**: cart icon from the reference → messages icon with unread badge (mirrors
  `fleazo-frontend`'s `Header`/`UnreadBadge` pattern, not a cart — no cart concept exists).
- **"Explore our recommendations" section** → renamed/reworked as **"Tin mới đăng"**
  (newest listings, chronological) — Fleazo has no recommendation engine, personalized or
  otherwise (see backend AGENTS.md → Listing Quality & AI Chatbot, dropped deliberately).
- **Footer CTA banner**: not a newsletter/email-capture form (no such backend feature
  exists) — reworked as a seller-acquisition CTA ("Có đồ không dùng nữa? Đăng tin ngay")
  linking to the post-listing flow.
- **Hero wordmark**: "Fleazo", set large enough (`text-[30vw]`) to run edge-to-edge
  against the hero image (matches the reference's oversized cropped "Shop" treatment),
  not shrunk to fit inside a frame. Centered horizontally, sitting low in the hero with
  the search bridge card overlapping its bottom edge.
- **Header is a floating inset pill, not a full-bleed bar** — `fixed`, with side gutters,
  so the homepage hero photo shows through around and behind it (as in the reference).
  Two consequences: (1) the hero is `min-h-dvh` starting at viewport top, header
  included, and (2) the header occupies **no flow space**, so any page without its own
  full-bleed hero must add top padding to clear it.
- **Hero photo source resolution**: the hero is `object-cover` over a full-viewport box,
  so the source file must be **at least 2000px wide (2560×1707 / 3:2 is the target)** —
  a smaller file gets upscaled and reads visibly blurry, and no CSS change fixes that.
  Avoid 16:9 sources: portrait (mobile) viewports crop a landscape image hard on the
  sides, so the flatter the source, the more of it disappears; 3:2 or 4:3 survives the
  crop better. Keep the subject mid-frame for the same reason. Don't switch to
  `object-contain` to "fix" cropping — that letterboxes and exposes bare scrim bands.
- **Hero photo + scrim**: an Unsplash 2400×1600 photo in `public/`, via `next/image` with
  `fill`+`priority`. A `from-fz-ink/40 via-fz-ink/65 to-fz-ink/90` gradient scrim sits
  between it and the wordmark — weighted toward the bottom, since that's where the white
  wordmark sits and where the photo's brightest areas fall. Measured worst-case contrast
  is **4.1:1 desktop / 3.9:1 mobile**, passing WCAG AA for large text (3:1).
  **Re-measure whenever the photo changes** — a brighter photo silently drops this below
  AA (swapping photos already took it to 2.4:1 once with the earlier, lighter scrim).
- **Hero `sizes` must over-declare on portrait viewports**: `object-cover` scales a 3:2
  photo by HEIGHT on a tall/narrow screen, but `sizes` is a *width* hint — a plain
  `sizes="100vw"` makes the browser fetch a variant that ends up upscaled ~3× and
  visibly blurry on phones. Hence `sizes="(max-width: 640px) 330vw, (max-width: 1024px)
  200vw, 100vw"`. Recompute those multipliers if the photo's aspect ratio changes.
- **Wordmark/card overlap is set in `em`, not `vw`** (`-mb-[0.17em]` on the `h1`): the
  card should clip only the *feet* of the letters, never cut across them. About 0.11em
  of that margin merely covers the empty space below the baseline, so the actual bite is
  ~8–9% of the letter height — and it stays that fraction at any font size, which `vw`
  would not.

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
app/                    # App Router — no src/ directory
├── layout.tsx          # Root layout: fonts (Space Grotesk + Hanken Grotesk, vietnamese
│                       #   subset), lang="vi", renders <Header/>/<Footer/> around
│                       #   children — no route groups yet, only Home exists so far
└── page.tsx            # Home — full-viewport photo hero + category grid + "Tin mới
                        #   đăng", see Layout decisions. `revalidate = 60`.

components/
├── ui/                  # shadcn-generated (Radix-based) — button.tsx, sheet.tsx
├── logo.tsx             # Text-based "Fleazo" logotype — no image asset yet
├── layout/
│   ├── header.tsx       # Fixed floating pill (see Layout decisions) — logo, nav,
│   │                    #   search/messages icons, Đăng tin CTA, guest Đăng nhập
│   │                    #   link (no real auth wired up yet), mobile Sheet
│   └── footer.tsx       # Đăng-tin CTA band + link columns + copyright
└── products/
    └── product-card.tsx # Trimmed card: condition+location badge, price pill — no
                         #   rating, no save button (no auth yet)

lib/
├── utils.ts             # cn() — shadcn class-merge util
├── api.ts               # Shared axios instance — interceptors, parseApiError,
│                        #   getStoredAccessToken, registerAuthFailureHandler (ported
│                        #   from fleazo-frontend, same backend contract, unchanged)
├── categories.ts        # getCategories()
├── products.ts          # getProducts, firstImageUrl, locationLabel
└── format.ts             # formatPrice

types/
├── api.types.ts          # ApiErrorResponse<TFields>
├── category.types.ts     # Category
└── product.types.ts      # Product (trimmed to what findAll returns — no `seller`,
                          #   that only exists on findOne)

styles/
└── globals.css         # Tailwind entry + brand/shadcn CSS variables — imported by
                        #   root layout as `@/styles/globals.css`. ⚠️ components.json
                        #   "tailwind.css" must point here or `shadcn add` breaks.

components.json          # shadcn CLI config (style: radix-nova, iconLibrary: lucide)
public/
└── hero-image.jpg       # Homepage hero photo (user-supplied) — see Layout decisions
                         #   for the scrim/contrast constraint tied to it
```

`hooks/`, `providers/` don't exist yet — create only when the first real need shows up
(matches `fleazo-frontend`'s "no empty placeholder folders" rule), not preemptively. No
`AuthProvider`/`useAuth` yet either — Header/ProductCard are built for a guest viewer
only; wire real auth state in before adding anything that needs a logged-in user.

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
│   │   └── danh-muc/ tim-kiem/   #     Category + search — the full reference layout
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
  `(protected)` is an *auth* decision; `(main)` vs `(header-only)` vs `(bare)` is a
  *how much chrome* decision. Watch for near-duplicates: a seller's public profile is
  public, "my profile" (editable) is protected — two different pages.
- **Every page under `(main)` goes in `(public)` or `(protected)`** — none directly in
  `(main)/`.
- **`(main)/layout.tsx` renders Header/Footer/BottomNav unconditionally.** A layout
  nested deeper *cannot* un-render them, so a page needing less chrome must live outside
  the `(main)` tree entirely — that's the whole reason `(header-only)`/`(bare)` are
  siblings of `(main)` rather than nested inside it.
- **Guard logic lives once in `ProtectedGuard`**, never re-checked per page. Each of
  `(main)/(protected)`, `(header-only)`, `(bare)` just wraps `children` in it.
- **Add every new protected page to `proxy.ts`'s `PROTECTED_PATHS`** as it's built,
  whichever group it's in.
- Route groups `(...)` never appear in the URL — they exist purely to give each area its
  own `layout.tsx`.

**Migration note — Header/Footer must move.** They currently render in
`app/layout.tsx` (fine while Home is the only page). The moment `(auth)` exists they
have to move down into `(main)/layout.tsx`, or login/register would inherit marketplace
chrome. Two things to re-check during that move: the Header is `fixed` and occupies no
flow space (see Layout decisions), so `(main)` pages without a full-bleed hero need
their own top padding; and `BottomNav` doesn't exist yet at all — it needs building
plus bottom padding on `(main)` pages so it never covers the last row of content.

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
- ✅ Done — `Header` (fixed floating pill), `Footer`, `Logo`, `ProductCard`, wired into
  the root layout
- ✅ Done — Home: full-viewport photo hero (measured for AA contrast + image sharpness,
  see Layout decisions), category grid, "Tin mới đăng" from real backend data
- 📋 Agreed, not started — the route-group split (`(auth)`/`(main)`/`(header-only)`/
  `(bare)`), `proxy.ts` guards, and `BottomNav`. See Project Structure → Planned
  route-group structure. Nothing here has been built; don't begin it unasked.
- Next: no page beyond Home exists yet. Whatever comes next, decide its route group
  first — building another page into the root layout would deepen the Header/Footer
  migration debt noted above.

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
