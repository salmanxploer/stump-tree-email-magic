**Project Report — BUBT Cafe (stump-tree-email-magic)**

This document summarizes the project, its architecture, setup steps, deployment guidance, important environment variables, security notes, and suggested next steps.

**Project Summary**:
- **Name:** BUBT Cafe — Cafeteria Management System
- **Purpose:** Web application for managing cafeteria operations (menu, orders, invoices, users) with distinct roles (admin, staff, student/customer).
- **Scope:** Full-stack application with a Vite + React + TypeScript frontend and an Express + TypeScript backend using MongoDB for persistence and Firebase for authentication.

**Key Features**:
- **Real-time order processing** (polling and live updates)
- **Automatic invoice generation** on order delivery
- **Role-based dashboards** (Admin / Staff / Student)
- **Menu management** with CRUD, stock, and availability
- **Order lifecycle management** (pending → preparing → ready → delivered)
- **Google OAuth and Firebase auth integration**
- **Invoice printing/download and order history**

**Technology Stack & Libraries**:
- **Frontend:** React 18, TypeScript, Vite, React Router, TailwindCSS, shadcn/Radix UI, TanStack Query, React Hook Form, Zod, Recharts, Firebase client SDK
- **Backend:** Node.js (18+), Express, TypeScript, Mongoose (MongoDB), Firebase Admin, Passport (Google OAuth), JSON Web Tokens
- **Dev Tools:** ESLint, TypeScript, PostCSS, Tailwind, `tsx` dev runner for server

**High-level Architecture**:
- **Client (SPA):** `src/` — React + TypeScript app built by Vite -> `dist/` static output.
- **API Server:** `server/src/` — Express API that handles auth sync, sessions (JWT), menu, orders, invoices, users.
- **Authentication:** Firebase for client auth; server optionally verifies Firebase ID tokens via Firebase Admin SDK and syncs/creates app users in MongoDB. Also supports email/password login and Google OAuth.
- **Data Storage:** MongoDB via Mongoose, models under `server/src/models/` (User, MenuItem, Order, Invoice).

**Important Files & Locations**:
- **Frontend entry:** `src/main.tsx`, `src/App.tsx`
- **Frontend Firebase config:** `src/lib/firebase.ts`
- **Frontend build config:** `package.json` (`build`: `vite build`), `vite.config.ts`
- **Backend entry:** `server/src/index.ts`
- **Backend config:** `server/src/config.ts`, `server/src/firebaseAdmin.ts`
- **Env examples:** `.env.example` (root) and docs in README

**Setup & Local Development**:
- Prereqs: `Node.js 18+`, `npm` (or `yarn`/`pnpm`), MongoDB (Atlas or local), Firebase project.
- Install dependencies (root + server):

```bash
npm install
cd server
npm install
cd ..
```

- Create env files:
  - Root `.env` (frontend): set `VITE_API_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
  - `server/.env`: set `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `CLIENT_URLS`, `ADMIN_EMAILS`.

- Run servers:

```bash
# Backend
cd server
npm run dev

# Frontend (from project root)
npm run dev
```

The application will be available at the frontend and backend addresses configured in the README.

**Build & Production**:
- Frontend build command: `npm run build` -> output `dist/`.
- Backend build: `cd server && npm run build` (then `node build/index.js` or use a process manager).

**Deployment Guidance**:

Frontend (Recommended: Netlify / Vercel / Cloudflare Pages)
- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing: add redirect so client-side routes resolve to `index.html`.
  - Option A: Add `public/_redirects` with `/* /index.html 200`
  - Option B: Add `netlify.toml` with:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- Set frontend environment variables in the Netlify (or Vercel) dashboard: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, and `VITE_API_URL`.

Backend (Options):
- Host as a separate service — recommended providers with free tiers / hobby plans: Render, Railway, Fly, Heroku (older free plans discontinued), or a small VPS.
- Provide environment variables securely on the host (do NOT embed secrets in the repo).
- Ensure `MONGODB_URI` points to Atlas (or managed DB) with backups.
- Expose API base URL and set `VITE_API_URL` on the frontend to point to the deployed backend.

Serverless/Functions Option:
- If you prefer a single-host approach, refactor select backend endpoints into serverless functions (Netlify Functions / Vercel Serverless Functions). The current server is a monolith and will require adaptation for serverless cold starts and file-based routing.

**Environment Variables (summary)**:
- Frontend (Vite):
  - `VITE_API_URL` / `VITE_API_BASE_URL`
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`
- Backend (`server/.env`):
  - `PORT`, `NODE_ENV`
  - `MONGODB_URI` (required)
  - `JWT_SECRET` (required)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (OAuth)
  - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (Firebase Admin)
  - `CLIENT_URLS`, `ADMIN_EMAILS`

**Security & Operational Notes**
- **Do not commit** secrets (Firebase private keys, JWT secrets, DB credentials). Keep them in the host environment or a secrets manager.
- The `FIREBASE_PRIVATE_KEY` contains newlines; store it exactly (or with `\\n` escaped). The server handles `replace(/\\n/g, '\n')` already.
- Add rate limiting, request validation, and input sanitization if this will be publicly accessible.
- Consider HTTPS-only cookies or secure token storage approaches for production.

**Areas for Improvement / Recommendations**
- Add automated tests: unit tests for important utilities and integration tests for API endpoints.
- Add end-to-end tests (Cypress / Playwright) for key user flows (login, place order, invoice generation).
- CI/CD: Add GitHub Actions to run lint, typecheck, test, then deploy to Netlify/Render.
- Observability: Add structured logging (e.g., Winston / Pino), error reporting (Sentry), and basic metrics/health checks.
- Security hardening: Helmet middleware, rate limiting, stronger CORS policies for production, and validate all inputs (Zod on backend requests).
- Backup strategy for MongoDB and rotation policy for secrets.

**Next Steps (Actionable Checklist)**
- [ ] Create `.env` files from `.env.example` and ensure secrets are set on hosts
- [ ] Add `public/_redirects` or `netlify.toml` for SPA routing
- [ ] Connect repo to Netlify (or Vercel) and configure build/publish + env vars for frontend
- [ ] Deploy backend to Render / Railway and configure `MONGODB_URI` + `JWT_SECRET` + Firebase Admin env vars
- [ ] Add GitHub Actions CI: `lint`, `build`, `test`, and optional deploy steps
- [ ] Add tests and monitoring

**Appendix: Useful Commands**
- Install dependencies (root + server):

```bash
npm install && cd server && npm install
```

- Dev run:

```bash
# server
cd server && npm run dev
# root (frontend)
npm run dev
```

- Build (frontend): `npm run build` -> `dist/`
- Deploy frontend with Netlify CLI:

```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

***End of report***
