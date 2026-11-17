# Kepparikauppa

A web shop for hobby horses (*keppihevonen*), utilities and accessories.

## Architecture

| Service        | Tech                            | Port |
|----------------|---------------------------------|------|
| frontend       | Vite + React + TypeScript, nginx (unprivileged, 8080) | 8080 |
| backend        | Node.js + Express + TypeScript   | 3000 |
| db             | PostgreSQL 17                   | 5432 |

Nginx serves the built frontend and reverse-proxies `/api` to the backend.

## Getting started

```bash
cp .env.example .env
docker compose up --build
```

Then open http://localhost:8080/

- `GET /api/health` – backend health check
- `GET /api/categories` – product categories
- `GET /api/products` – products (optional `?category=<slug>` filter)
- `GET /api/products/:id` – single product
- `POST /api/orders` – place an order

## Local development

Frontend (hot reload):
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Backend (hot reload via tsx):
```bash
cd backend
npm install
npm run dev   # http://localhost:3000
```

The frontend dev server proxies `/api` to the backend (see `vite.config.ts`).
