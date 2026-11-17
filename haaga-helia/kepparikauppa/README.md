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

### API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | public | Health check |
| `/api/auth/register` | POST | public | Register (`email`, `password`, optional `role`: `customer` or `manager`) |
| `/api/auth/login` | POST | public | Login (`email`, `password`) |
| `/api/auth/me` | GET | Bearer | Current user |
| `/api/users` | GET | manager | List all users |
| `/api/users/:id/role` | PATCH | manager | Change a user's role |
| `/api/users/:id` | DELETE | manager | Delete a user |
| `/api/categories` | GET | public | Product categories |
| `/api/products` | GET | public | Products (optional `?category=<slug>`) |
| `/api/products/:id` | GET | public | Single product |
| `/api/products/:id/image` | GET | public | Product image (stored in PostgreSQL bytea) |
| `/api/products/:id/image` | POST | manager | Upload product image (multipart) |
| `/api/products` | POST | manager | Create product |
| `/api/products/:id` | PUT | manager | Update product |
| `/api/products/:id` | DELETE | manager | Delete product |
| `/api/orders` | POST | customer | Place order |
| `/api/orders` | GET | customer/manager | Order history (manager sees all) |
| `/api/orders/:id` | GET | customer/manager | Order detail |

### Demo accounts (seeded)

| Email | Password | Role |
|-------|----------|------|
| manager@keppari.fi | salainen123 | manager |
| asiakas@keppari.fi | salainen123 | customer |

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
