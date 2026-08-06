# EdMarg — Local Development Guide

This guide gets you from a fresh clone to a running full-stack environment with
**hot reload** in a couple of minutes. Two workflows are supported:

- **Docker (recommended)** — one command starts MongoDB, the backend, and the
  frontend. No local Node/Mongo install required.
- **Manual** — run each service on your host with your own MongoDB.

---

## Prerequisites

| Tool | Docker workflow | Manual workflow |
|------|:---------------:|:---------------:|
| Docker + Docker Compose v2 | ✅ | — |
| Node.js (backend ≥18, frontend 24.x) | — | ✅ |
| MongoDB 7 | — | ✅ (local or Atlas) |
| GNU Make (optional, for `make` shortcuts) | optional | optional |

> On macOS: `brew install make` if you want the shortcuts (or just run the
> `docker compose` commands directly). Docker Desktop includes Compose v2.

---

## Quick start (Docker)

```bash
# 1. Create your local env files (generates a random JWT secret)
make setup            # or: ./scripts/setup-dev.sh

# 2. Start everything with hot reload
make dev              # or: docker compose -f docker-compose.dev.yml up

# 3. In another terminal, seed an admin user + sample assessments
make seed
```

Then open:

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:5000 |
| Health   | http://localhost:5000/health |
| MongoDB  | mongodb://localhost:27017/edmarg_db |

Edit any file under `backend/` or `frontend/` and the change reloads
automatically — no rebuild needed.

Default seeded admin (from `backend/.env`, override before seeding if you like):

```
email:    admin99@gmail.com
password: admin99password
```

---

## Common commands

Run `make help` to list them all. The most used:

| Command | What it does |
|---------|--------------|
| `make dev` | Start the stack (foreground, logs attached) |
| `make up` | Start the stack in the background |
| `make down` | Stop and remove containers |
| `make logs` | Tail all logs (`logs-backend` / `logs-frontend` for one) |
| `make seed` | Seed admin user + sample assessments |
| `make mongo` | Open a `mongosh` shell on the dev database |
| `make shell-backend` | Shell into the backend container |
| `make build` | Rebuild images after changing dependencies |
| `make clean` | Stop **and wipe** the database volume |

Prefer raw Compose? Every target maps to:

```bash
docker compose -f docker-compose.dev.yml <up|down|logs|exec ...>
```

---

## How the dev setup works

- **`docker-compose.dev.yml`** mounts your source into each container and runs
  the dev servers (`nodemon + ts-node` for the backend, `next dev` for the
  frontend). Your host `node_modules` is *not* used — each service keeps its own
  in a named volume so native modules (sharp, etc.) match the Linux container.
- **File watching** uses polling (`CHOKIDAR_USEPOLLING` / `WATCHPACK_POLLING`)
  because bind-mounted filesystems don't always emit inotify events.
- **MongoDB** persists to the `mongodb_dev_data` volume, so your data survives
  restarts. `make clean` removes it for a fresh start.
- **Env files** — the backend reads `backend/.env`, the frontend reads
  `frontend/.env.local`. Compose overrides `MONGODB_URI` to point at the
  `mongodb` service automatically, so the same `.env` works in and out of Docker.

> Note: `docker-compose.yml` (no `.dev`) is the **production-style** build used
> for deployment parity — optimized images, `NODE_ENV=production`, no mounts.
> Use `docker-compose.dev.yml` for day-to-day development.

---

## Configuring optional integrations

The core app (auth, mentors, bookings, assessments, messaging) runs with just
the generated `.env`. These features need extra credentials in `backend/.env`:

| Feature | Variables |
|---------|-----------|
| Image/video uploads | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Video sessions | `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_WEBHOOK_SECRET` |
| Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` |
| Clerk auth/webhooks | `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` |

After editing `backend/.env`, restart the backend: `make restart` (or
`docker compose -f docker-compose.dev.yml restart backend`).

---

## Manual workflow (without Docker)

<details>
<summary>Expand if you prefer running services directly on your host</summary>

```bash
# One-time: create env files
./scripts/setup-dev.sh

# Terminal 1 — MongoDB (if not using Atlas)
#   brew services start mongodb-community   # or run mongod yourself

# Terminal 2 — backend
cd backend
npm install
npm run dev            # http://localhost:5000

# Terminal 3 — frontend
cd frontend
npm install
npm run dev            # http://localhost:3000

# Seed data (backend running)
cd backend
npm run seed:admin
npm run seed:assessments
```

Make sure `MONGODB_URI` in `backend/.env` points at your MongoDB
(`mongodb://127.0.0.1:27017/edmarg_db` for a local install).

</details>

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **Port already in use (3000/5000/27017)** | Stop the conflicting process, or change the host port mapping in `docker-compose.dev.yml`. |
| **Backend logs `MONGODB_URI ... MISSING`** | Run `make setup`; confirm `backend/.env` exists. In Docker the URI is injected automatically. |
| **Changes not hot-reloading** | Polling is enabled by default; if it still misses, `make restart`. On Linux ensure the bind mount isn't on a networked FS. |
| **Native module errors (e.g. sharp) after `npm install` on host** | Rebuild the image so deps compile for Linux: `make build`. |
| **Frontend can't reach the API** | Backend must be on `http://localhost:5000`; check `make logs-backend` and the `NEXT_PUBLIC_*` values. |
| **Want a clean database** | `make clean` then `make up && make seed`. |

---

For architecture, API endpoints, and the full feature list, see
[README.md](./README.md).
