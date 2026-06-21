# Hero Pricing Engine

A full-stack sales portal for **Hero Cycles** that lets sales teams manage bicycle parts, build custom cycle configurations, calculate prices in real time, and review configuration analytics from a single dashboard.

The repository is split into two applications:

| App | Stack | Default URL |
|-----|-------|-------------|
| **Backend** (`backend/`) | Node.js, Express 5, PostgreSQL | `http://localhost:5000` |
| **Frontend** (`frontend/`) | React 19, Vite 8, React Router, Axios | `http://localhost:5173` |

---

## Table of Contents

- [Features](#features)
- [Architecture Highlights](#architecture-highlights)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Set up PostgreSQL](#2-set-up-postgresql)
  - [3. Backend setup](#3-backend-setup)
  - [4. Frontend setup](#4-frontend-setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Build & Deployment](#build--deployment)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Scripts Reference](#scripts-reference)

---

## Features

### Frontend

| Module | Description |
|--------|-------------|
| **Landing page** | Product overview and quick entry to the app |
| **Dashboard** | Stat cards (Total Parts → Parts Manager, Total Configurations → Build Config), price analytics chart, and a recent configurations table |
| **Parts Manager** | CRUD for parts with **server-side** pagination, category filter, and **debounced search** (300 ms) |
| **Build Configuration** | Create/edit/delete configurations; saved-config table uses **server-side pagination + debounced search**; part pickers fetch from the API on demand |
| **Configuration viewer** | Inspect a saved build with part breakdown and total price |
| **Pricing Calculator** | Ad-hoc price calculation; part dropdowns load from the API with debounced search per category |

### Backend

- **REST API** under `/api` for parts and configurations
- **Server-side pagination & search** on all list endpoints (`LIMIT`/`OFFSET` at the database level)
- **PostgreSQL persistence** with schema via `schema.sql`
- **Price history tracking** when part prices are updated
- **Configuration pricing** — automatic total calculation from linked parts
- **Reusable pagination utilities** in `backend/src/utils/pagination.js`


---

## Architecture Highlights

### Pagination & search (backend-driven)

List endpoints no longer return a raw array. They return a paginated envelope:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalRecords": 125,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Query parameters: `page`, `limit` (max 100), `search` (case-insensitive). Parts also support `category`.

The frontend **does not** load full datasets into the browser for list views. It requests one page at a time and renders pagination controls from the metadata returned by the API.

### Debounced search (frontend)

Search inputs in **Parts Manager** and **Build Configuration** use a shared `useDebounce` hook (`frontend/src/hooks/useDebounce.js`, 300 ms delay). The API is called only after the user pauses typing, which reduces unnecessary requests while searching large inventories.

Part dropdowns in **Build Configuration** and **Pricing Calculator** also debounce search before calling `GET /api/parts`.

### Layered backend structure

```
Request → routes → controllers → services → repositories → PostgreSQL
```

Business logic lives in **services**. SQL and filtering live in **repositories**. Controllers parse query params and format responses.

---

## Prerequisites

Install the following before setting up the project:

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | `20.19+` or `22.12+` | Required by Vite 8. **Node.js 21 is not supported** and will cause build failures. |
| **npm** | `10+` (bundled with Node) | Used for dependency installation and scripts |
| **PostgreSQL** | `14+` recommended | Local instance or remote database |

Verify your environment:

```bash
node --version    # should be v20.19+, v22.12+, or v25+
npm --version
psql --version    # optional but recommended for CLI database setup
```

---

## Project Structure

```
hero-pricing-engine/
├── README.md
├── .gitignore
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── schema.sql
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       │   ├── env.js
│       │   └── database.js
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── middlewares/
│       └── utils/
│           ├── pagination.js    # parsePaginationQuery, buildPaginationMeta, sendPaginatedResponse
│           ├── AppError.js
│           └── asyncHandler.js
│
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── config/
        │   └── api.js              # API base URL (VITE_API_URL)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   └── Pagination.jsx      # Shared pagination controls (uses backend metadata)
        ├── hooks/
        │   └── useDebounce.js      # Debounce hook for search inputs
        └── pages/
            ├── Landing.jsx
            ├── Dashboard.jsx
            ├── Parts.jsx
            ├── ConfigBuilder.jsx
            ├── ConfigView.jsx
            └── PricingCalculator.jsx
```

### Frontend routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/dashboard` | Dashboard |
| `/parts` | Parts Manager |
| `/builder` | Build Configuration |
| `/config/:id` | Configuration detail |

---

## Installation & Setup

Complete these steps in order. Both the backend and frontend must be running for the app to work end-to-end.

### 1. Clone the repository

```bash
git clone https://github.com/Sahaj1112/hero-pricing-engine.git
cd hero-pricing-engine
```

### 2. Set up PostgreSQL

**Create a database** (replace values as needed):

```sql
CREATE DATABASE hero_pricing;
```

**Load the schema and seed data** from the project root:

```bash
# macOS / Linux / Git Bash
psql -U postgres -d hero_pricing -f backend/schema.sql
```

```powershell
# Windows PowerShell
psql -U postgres -d hero_pricing -f backend\schema.sql
```

This creates four tables (`parts`, `price_history`, `configurations`, `config_parts`) and inserts eight sample parts across frame, gear, tyre, and accessory categories.

**Alternative (pgAdmin):** Open pgAdmin → connect to your server → select the `hero_pricing` database → open Query Tool → paste the contents of `backend/schema.sql` → execute.

### 3. Backend setup

```bash
cd backend
npm install
```

Create your environment file from the template:

```bash
# macOS / Linux / Git Bash
cp .env.example .env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

Edit `backend/.env` with your PostgreSQL credentials (see [Environment Variables](#environment-variables)).

Start the API server:

```bash
npm run dev
```

Expected output:

```
Server running on port 5000
```

Verify the API is up:

```bash
curl http://localhost:5000/
# {"message":"Hero Cycles API running ✅"}
```

Verify paginated parts endpoint:

```bash
curl "http://localhost:5000/api/parts?page=1&limit=10"
```

### 4. Frontend setup

Open a **second terminal** (keep the backend running):

```bash
cd frontend
npm install
```

Create the frontend environment file (optional for local dev):

```bash
# macOS / Linux / Git Bash
cp .env.example .env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

For local development, you can leave `VITE_API_URL` empty in `.env`; the app defaults to `http://localhost:5000`.

---

## Environment Variables

### Backend (`backend/.env`)

Copy from `backend/.env.example` and fill in every value:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DB_USER` | Yes | PostgreSQL username | `postgres` |
| `DB_HOST` | Yes | Database host | `localhost` |
| `DB_NAME` | Yes | Database name | `hero_pricing` |
| `DB_PASSWORD` | Yes | Database password | `your_password` |
| `DB_PORT` | Yes | PostgreSQL port | `5432` |
| `PORT` | No | API server port (default: `5000`) | `5000` |

**Example `backend/.env`:**

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=hero_pricing
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
```

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example`:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | No | Backend base URL (no trailing slash). Defaults to `http://localhost:5000` if unset. | `http://localhost:5000` |

**Example `frontend/.env` for local development:**

```env
VITE_API_URL=http://localhost:5000
```

---

## Running Locally

You need **two terminals** — one for the backend, one for the frontend.

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Open the app in your browser:

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Frontend (landing page) |
| `http://localhost:5173/dashboard` | Dashboard |
| `http://localhost:5000` | Backend health check |

**Quick smoke test after startup:**

1. Visit `http://localhost:5173` and click **Open App** (or go directly to `/dashboard`)
2. Confirm stat cards show part and configuration counts
3. Open **Parts Manager** — you should see seeded parts with pagination controls
4. Type in the search box — results update after a brief pause (debounced)
5. Open **Build Configuration** — search saved configs; create a new configuration using the part pickers

---

## Build & Deployment

### Frontend production build

```bash
cd frontend
npm run build
```

Output is written to `frontend/dist/`.

Preview the production build locally:

```bash
npm run preview
# Serves dist/ at http://localhost:4173 by default
```

Set `VITE_API_URL` to your deployed backend URL **before** running `npm run build`.

Serve `frontend/dist/` with any static file host (Nginx, Vercel, Netlify, S3 + CloudFront, etc.).

### Backend production

```bash
cd backend
npm install --omit=dev
npm start
```

The backend is a standard Node.js process. Deploy it to any Node-compatible host (Railway, Render, Fly.io, a VPS, etc.) with:

- All `backend/.env` variables configured in the host's environment
- PostgreSQL reachable from the server
- `schema.sql` applied to the production database

### Suggested deployment layout

```
[Browser] → [Static host: frontend/dist] → API calls → [Node backend :5000] → [PostgreSQL]
```

Enable HTTPS in production and set `VITE_API_URL` to your HTTPS API origin.

---

## API Reference

Base URL: `http://localhost:5000` (local)

All JSON API routes are prefixed with `/api`. Errors return `{ "error": "message" }` with an appropriate HTTP status code.

### Health check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API status message |

### Parts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/parts` | Paginated parts list |
| `POST` | `/api/parts` | Create a part |
| `PUT` | `/api/parts/:id` | Update a part (records price history on price change) |
| `DELETE` | `/api/parts/:id` | Delete a part |
| `GET` | `/api/parts/:id/history` | Paginated price change history for a part |

**Create / update body:**

```json
{ "name": "Aluminium Frame", "category": "frame", "price": 2500 }
```

**Valid `category` values:** `frame`, `gear`, `tyre`, `accessory`

**List query parameters (`GET /api/parts`, `GET /api/parts/:id/history`):**

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `10` | Records per page (max 100) |
| `search` | — | Case-insensitive search (`name`, `category` for parts; price values for history) |
| `category` | — | Filter parts by category (`frame`, `gear`, `tyre`, `accessory`) — parts list only |

**Paginated list response:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalRecords": 125,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Examples:**

```bash
# Paginated parts with search and category filter
curl "http://localhost:5000/api/parts?page=1&limit=10&search=tyre&category=tyre"

# Create a part
curl -X POST http://localhost:5000/api/parts \
  -H "Content-Type: application/json" \
  -d '{"name":"Carbon Frame","category":"frame","price":4500}'

# Paginated price history
curl "http://localhost:5000/api/parts/1/history?page=1&limit=10"
```

### Configurations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/configurations/stats` | Dashboard stats (totals, averages, enriched config list for charts) |
| `GET` | `/api/configurations` | Paginated configurations list |
| `GET` | `/api/configurations/:id` | Single configuration with parts and `total_price` |
| `POST` | `/api/configurations` | Create configuration |
| `PUT` | `/api/configurations/:id` | Update configuration |
| `DELETE` | `/api/configurations/:id` | Delete a configuration |

**Create / update body:**

```json
{
  "name": "City Commuter",
  "description": "Budget daily rider",
  "part_ids": [2, 4, 6, 7]
}
```

**List query parameters (`GET /api/configurations`):**

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `10` | Records per page (max 100) |
| `search` | — | Case-insensitive search on `name` and `description` |

**Examples:**

```bash
# Paginated search
curl "http://localhost:5000/api/configurations?page=1&limit=10&search=mountain"

# Recent configs for dashboard (first page, limit 5)
curl "http://localhost:5000/api/configurations?page=1&limit=5"

# Dashboard stats
curl "http://localhost:5000/api/configurations/stats"

# Create a configuration
curl -X POST http://localhost:5000/api/configurations \
  -H "Content-Type: application/json" \
  -d '{"name":"City Commuter","description":"Budget daily rider","part_ids":[2,4,6,7]}'
```

---

## Troubleshooting

### `npm run build` fails with Node.js version error

**Symptom:** `Vite requires Node.js version 20.19+ or 22.12+` or `ERR_INVALID_ARG_VALUE` during build.

**Cause:** Node.js 21.x is not supported by Vite 8.

**Fix:** Install Node.js 22 LTS or 20.19+, then confirm:

```bash
node --version
```

### Backend starts but API returns `500` errors

**Common causes:**

1. **PostgreSQL is not running** — start the PostgreSQL service.
2. **Database not created or schema not applied** — re-run `backend/schema.sql`.
3. **Wrong credentials in `backend/.env`** — verify `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and `DB_NAME`.

Test the database connection manually:

```bash
psql -U postgres -d hero_pricing -c "SELECT COUNT(*) FROM parts;"
# Should return 8 after running schema.sql
```

### Parts or configurations table is empty / shows errors

**Symptom:** Frontend tables show "Loading…" forever or empty results.

**Fixes:**

1. Confirm backend is running: `curl http://localhost:5000/`
2. Test paginated endpoint directly:
   ```bash
   curl "http://localhost:5000/api/parts?page=1&limit=10"
   ```
   Response must include `success`, `data`, and `pagination` — not a bare array.
3. Check browser DevTools → Network for failed requests to `VITE_API_URL`.
4. Restart Vite after changing `frontend/.env`.

### Search feels slow or fires too many requests

Search in Parts Manager and Build Configuration is **debounced by 300 ms**. A short pause after typing is expected before results update. This is intentional to avoid hammering the API on every keystroke.

### Frontend cannot reach the API (network errors in browser console)

1. Confirm the backend is running: `curl http://localhost:5000/`
2. Check `frontend/.env` — `VITE_API_URL` should be `http://localhost:5000` with **no trailing slash**.
3. After changing `frontend/.env`, restart the Vite dev server (`Ctrl+C`, then `npm run dev` again).
4. For production builds, rebuild after changing `VITE_API_URL`.

### Config builder won't save

The form requires **one part from each required category** (frame, gear, tyre). Accessories are optional.

---

## Scripts Reference

### Backend (`backend/package.json`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the API server |
| `npm start` | Same as `dev` — start the API server |

### Frontend (`frontend/package.json`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
