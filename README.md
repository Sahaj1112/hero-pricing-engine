# Hero Pricing Engine

A full-stack sales portal for **Hero Cycles** that lets sales teams manage bicycle parts, build custom cycle configurations, calculate prices in real time, and review configuration analytics from a single dashboard.

The repository is split into two applications:

| App | Stack | Default URL |
|-----|-------|-------------|
| **Backend** (`backend/`) | Node.js, Express 5, PostgreSQL, JWT | `http://localhost:5000` |
| **Frontend** (`frontend/`) | React 19, Vite 8, React Router, Axios | `http://localhost:5173` |

---

## Table of Contents

- [Features](#features)
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
- [Demo Credentials](#demo-credentials)

---

## Features

### Frontend
- **Landing page** — product overview and feature highlights
- **Authentication** — JWT-based login with protected routes
- **Dashboard** — configuration statistics, price chart, and recent builds
- **Parts management** — CRUD for parts with category filtering and pagination
- **Configuration builder** — assemble cycles from frame, gear, tyre, and accessory parts
- **Configuration viewer** — inspect saved builds with part breakdown and total price

### Backend
- **REST API** under `/api` for auth, parts, and configurations
- **PostgreSQL persistence** with schema migrations via `schema.sql`
- **Price history tracking** when part prices are updated
- **Configuration pricing** — automatic total calculation from linked parts
- **JWT authentication** for login (MVP uses hardcoded users; API routes are not token-guarded yet)

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
├── README.md                 # This file
├── .gitignore
│
├── backend/
│   ├── .env.example          # Backend environment template
│   ├── package.json
│   ├── schema.sql            # Database tables + seed data
│   └── src/
│       ├── server.js         # HTTP server entry point
│       ├── app.js            # Express app configuration
│       ├── config/
│       │   ├── env.js        # Environment variable loader
│       │   ├── database.js   # PostgreSQL connection pool
│       │   └── users.js      # Hardcoded MVP user accounts
│       ├── routes/           # API route definitions
│       ├── controllers/      # Request handlers
│       ├── services/         # Business logic
│       ├── repositories/     # Database queries
│       ├── middlewares/      # Error handling
│       └── utils/            # Helpers (AppError, asyncHandler)
│
└── frontend/
    ├── .env.example          # Frontend environment template
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/               # Static assets (favicon, icons)
    └── src/
        ├── main.jsx          # React entry point
        ├── App.jsx           # Routing and layout
        ├── index.css         # Global styles
        ├── config/
        │   └── api.js        # API base URL (VITE_API_URL)
        ├── components/       # Navbar, Sidebar
        ├── context/          # Theme context
        └── pages/            # Landing, Login, Dashboard, Parts, etc.
```

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

Edit `backend/.env` with your PostgreSQL credentials and a JWT secret (see [Environment Variables](#environment-variables)).

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

### 4. Frontend setup

Open a **second terminal** (keep the backend running):

```bash
cd frontend
npm install
```

Create the frontend environment file (optional for local dev — see below):

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
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens | `a-long-random-string` |
| `PORT` | No | API server port (default: `5000`) | `5000` |

**Example `backend/.env`:**

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=hero_pricing
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=change-me-to-a-long-random-secret
PORT=5000
```

> Login will fail with a `500` error if `JWT_SECRET` is missing or empty.

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
| `http://localhost:5173/login` | Login page |
| `http://localhost:5000` | Backend health check |

**Quick smoke test after startup:**

1. Visit `http://localhost:5173/login`
2. Sign in with `admin` / `admin123`
3. Open **Dashboard** — you should see configuration stats
4. Open **Parts** — you should see the eight seeded parts

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

### Authentication

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/api/auth/login` | `{ "username": "admin", "password": "admin123" }` | `{ "token": "...", "user": { "id", "username", "role" } }` |

### Parts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/parts` | List all parts (ordered by category, name) |
| `POST` | `/api/parts` | Create a part — body: `{ "name", "category", "price" }` |
| `PUT` | `/api/parts/:id` | Update a part (records price history on price change) |
| `DELETE` | `/api/parts/:id` | Delete a part |
| `GET` | `/api/parts/:id/history` | Price change history for a part |

**Valid `category` values:** `frame`, `gear`, `tyre`, `accessory`

**Example — create a part:**

```bash
curl -X POST http://localhost:5000/api/parts \
  -H "Content-Type: application/json" \
  -d '{"name":"Carbon Frame","category":"frame","price":4500}'
```

### Configurations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/configurations/stats` | Dashboard stats (totals, averages, enriched config list) |
| `GET` | `/api/configurations` | List all configurations |
| `GET` | `/api/configurations/:id` | Single configuration with parts and `total_price` |
| `POST` | `/api/configurations` | Create configuration — body: `{ "name", "description", "part_ids": [1, 3, 5] }` |
| `DELETE` | `/api/configurations/:id` | Delete a configuration |

**Example — create a configuration:**

```bash
curl -X POST http://localhost:5000/api/configurations \
  -H "Content-Type: application/json" \
  -d '{"name":"City Commuter","description":"Budget daily rider","part_ids":[2,4,6,7]}'
```

---

## Demo Credentials

Authentication uses hardcoded MVP accounts in `backend/src/config/users.js`:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | salesperson |
| `sales1` | `sales123` | salesperson |

JWT tokens expire after **8 hours**. The frontend stores the token in `localStorage`.

---

## Troubleshooting

### `npm run build` fails with Node.js version error

**Symptom:** `Vite requires Node.js version 20.19+ or 22.12+` or `ERR_INVALID_ARG_VALUE` during build.

**Cause:** Node.js 21.x is not supported by Vite 8.

**Fix:** Install Node.js 22 LTS or 20.19+, then confirm:

```bash
node --version
```

If multiple Node installations exist, ensure the correct one is first on your `PATH`.

### Backend starts but API returns `500` errors

**Common causes:**

1. **PostgreSQL is not running** — start the PostgreSQL service.
2. **Database not created or schema not applied** — re-run `backend/schema.sql`.
3. **Wrong credentials in `backend/.env`** — verify `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and `DB_NAME`.
4. **Missing `JWT_SECRET`** — login specifically requires this; set it in `backend/.env` and restart the server.

Test the database connection manually:

```bash
psql -U postgres -d hero_pricing -c "SELECT COUNT(*) FROM parts;"
# Should return 8 after running schema.sql
```

### Login returns "Invalid username or password" (401)

- Confirm you are using `admin` / `admin123` or `sales1` / `sales123`.
- Check that the backend is running on the port expected by the frontend.

### Frontend cannot reach the API (network errors in browser console)

1. Confirm the backend is running: `curl http://localhost:5000/`
2. Check `frontend/.env` — `VITE_API_URL` should be `http://localhost:5000` with **no trailing slash**.
3. After changing `frontend/.env`, restart the Vite dev server (`Ctrl+C`, then `npm run dev` again).
4. For production builds, rebuild after changing `VITE_API_URL`.

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


