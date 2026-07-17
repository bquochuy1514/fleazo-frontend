# Fleazo Frontend

Web app for **Fleazo** — a secondhand marketplace platform for Vietnamese university students, featuring an AI-powered recommendation engine and shopping chatbot.

> Backend: `fleazo-backend` · AI Service: `fleazo-ai`

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack) |
| Language   | TypeScript                         |
| UI Library | React 19                           |
| Styling    | Tailwind CSS v4                    |
| HTTP       | axios                              |
| Realtime   | socket.io-client                   |

> Additional libraries (state management, forms, UI components...) are adopted incrementally as features are built — see `AGENTS.md` → Tech Stack for the current confirmed/undecided list.

## Core Features

- **Marketplace UI** — browse, search, and filter secondhand listings; product detail with image gallery; save/favorite listings
- **Listing management** — create/edit listings with multi-image upload, drafts, location picker (Tỉnh/Thành phố → Phường/Xã)
- **Auth flows** — register with email OTP, login, Google OAuth, forgot password, refresh token rotation
- **Realtime chat** — 1-to-1 messaging with read receipts, message recall, online status, and inbox notifications while browsing
- **Seller reputation** — review sellers after chatting about a listing, seller reply
- **Monetization** — membership tiers (Free/Basic/Premium), boost, and extend listing via PayOS checkout
- **AI shopping assistant** — chatbot that finds listings from natural language (powered by `fleazo-ai`)
- **Admin UI** — listing approval/rejection, user and category management

## Prerequisites

- Node.js >= 20
- `fleazo-backend` running locally (default: `http://localhost:8080`)

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/bquochuy1514/fleazo-frontend.git
cd fleazo-frontend

# 2. Install dependencies
npm install

# 3. Copy env file and fill in values
cp .env.example .env

# 4. Start dev server
npm run dev
```

App runs at `http://localhost:3000`.

## Project Structure

```
src/
└── app/                  # App Router pages & layouts
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
public/                   # Static assets
```

> Structure will grow as features are built (`components/`, `lib/`, `hooks/`, `types/`...) — kept in sync in `AGENTS.md`.

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

## Development Status

| Area          | Status  |
| ------------- | ------- |
| Project setup | Done    |
| Auth          | Planned |
| Products      | Planned |
| Categories    | Planned |
| Profile       | Planned |
| Chat          | Planned |
| Reviews       | Planned |
| Payments      | Planned |
| Chatbot       | Planned |
| Admin         | Planned |

## License

MIT
