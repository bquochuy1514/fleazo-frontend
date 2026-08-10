# Fleazo Frontend

Web app for **Fleazo** — a secondhand marketplace for Vietnamese university students to buy and sell within their own campus community. A from-scratch UI redesign; all business logic mirrors the backend 1:1.

**Live demo:** [fleazo-frontend.vercel.app](https://fleazo-frontend.vercel.app/)

> Backend: [`fleazo-backend`](https://github.com/bquochuy1514/fleazo-backend) · AI Service: [`fleazo-ai`](https://github.com/bquochuy1514/fleazo-ai)

## Tech Stack

| Layer     | Technology                                        |
| --------- | ------------------------------------------------- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript   |
| Styling   | Tailwind CSS v4 + shadcn/ui (Radix UI primitives) |
| Data      | axios (REST) + socket.io-client (realtime chat)   |
| Forms/UX  | Sonner (toasts), dayjs (dates), react-markdown    |

## Core Features

- **Browse & search** — category tree, keyword search with filters (price, condition, location), listing detail pages.
- **Post a listing** — photo upload, category + location picker, an "AI gợi ý" button that drafts title/description/category from the first few photos (via `fleazo-ai`), drafts, and admin-reviewed publish. Editing a _live_ listing routes the change through admin approval too, same as a new listing.
- **Membership** — plan comparison and upgrade/renew flow (Free / Basic / Premium), paid through PayOS.
- **Realtime chat** — 1-to-1 messaging with read receipts, recall, and online status.
- **Reviews** — rate a seller after messaging them; a "Đánh giá của tôi" page shows both reviews received and reviews given.
- **Saved listings** — a personal shortlist ("Tin đã lưu").
- **Account** — profile editing, avatar upload, password change/add (Google-only accounts can add a password), listing management with status tabs (pending/active/rejected/sold/...).
- **AI shopping chatbot** — floating widget that answers "how do I..." questions and can search real listings on request.
- **Admin panel** — moderation queue for new listings and edits to live ones (approve/reject with a reason).
- Static content: giới thiệu, hướng dẫn đăng tin, câu hỏi thường gặp, liên hệ.

## Prerequisites

- Node.js >= 20
- A running `fleazo-backend` instance

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/bquochuy1514/fleazo-frontend.git
cd fleazo-frontend

# 2. Install dependencies
npm install

# 3. Copy env file and fill in values
cp .env.example .env.local

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

Route groups split by chrome/auth requirements, not by feature:

```
app/
├── (auth)/            # Login, register, OTP verify, forgot/reset password — no header
├── (bare)/tin-nhan/    # Chat — its own full-screen layout
├── (header-only)/      # Header but no footer: đăng tin, admin panel
└── (main)/             # Full marketplace chrome (header + footer)
    ├── (public)/        # Browse, search, product/seller pages, static content
    └── (protected)/     # Requires login: profile, listing mgmt, saved, reviews, membership

components/    # Shared UI (shadcn primitives, forms, layout, chat, reviews...)
hooks/         # useAuth, etc.
lib/           # API clients, one file per backend resource (products.ts, reviews.ts, ...)
providers/     # Auth context
types/         # Types mirroring backend response shapes
```

Protected routes are enforced client-side by `ProtectedGuard`, driven by `lib/protected-paths.ts` — keep that list in sync with any new route under `(protected)`.

## Environment Variables

See [`.env.example`](.env.example). Both point at the backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

## Deployment

Deployed to [Vercel](https://vercel.com) (zero-config for Next.js) — connect the repo and set the two env vars above to the deployed backend's URL.

## License

MIT
