# Dr. Arun Dental Care — Website & Clinic Platform

A full-stack website and patient/OP management system for Dr. Arun Dental Care, Kuppam.

- `frontend/` — React + TypeScript (Vite), plain CSS Modules. Public site + admin dashboard UI.
- `backend/` — Node.js + Express + TypeScript, Prisma ORM. REST API, auth, OP number generation, file uploads.

## 1. First-time setup

```bash
cd backend
npm install
cp .env.example .env      # then edit .env — see "Before you go live" below
npm run prisma:migrate    # creates the SQLite database and applies the schema
npm run seed               # creates the admin login from ADMIN_EMAIL / ADMIN_PASSWORD in .env

cd ../frontend
npm install
```

## 2. Running locally

Run both in separate terminals:

```bash
cd backend && npm run dev     # API on http://localhost:4000
cd frontend && npm run dev    # Website on http://localhost:5173 (proxies /api to the backend)
```

Visit `http://localhost:5173`. Admin dashboard: `http://localhost:5173/admin` (signs you in via
`/admin/login` first if needed), using the
`ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `backend/.env`.

## 3. Before you go live

Real clinic details (address, phone, WhatsApp, hours) are already wired in from the clinic's public
Justdial listing — see `frontend/src/config/clinicInfo.ts`. A few things still need attention
before publishing:

| What | Where |
| --- | --- |
| Google Maps **embed precision** — currently built from the text address (works, but not a verified exact pin) | `frontend/src/config/clinicInfo.ts` → `googleMapsEmbedUrl`/`googleMapsUrl`. For an exact pin, get the real embed URL from Google Maps → Share → Embed a map → copy the `src="..."` |
| Doctor and clinic photography — the site currently uses clean placeholder graphics (a monogram avatar, an info card), not photos | Once real photos exist, add them under `frontend/public/assets/` and swap `<DoctorAvatar />` in `Home.tsx`/`About.tsx` for an `<img>`, and the hero panel in `Home.tsx` for a photo-based hero |
| Rating (currently shown as "5.0 rated on Justdial" on the Location page) | `frontend/src/config/clinicInfo.ts` → `ratingValue`/`ratingSource` — this is a live number, re-verify it periodically against the actual listing |
| Services actually offered, and their descriptions | `frontend/src/data/services.data.ts` — current `available` flags reflect the clinic's confirmed Justdial services (consultation, root canal, extractions, fillings/crowns/bridges, cleaning/scaling); flip others to `true` once the clinic confirms they're offered |
| Admin password | Re-run `npm run seed` in `backend/` with a new `ADMIN_PASSWORD` in `.env` |
| `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | `backend/.env` — never commit this file |

**Why there's no custom illustration or hero photo**: an earlier hand-drawn SVG tooth illustration
in the hero didn't render well and looked unprofessional. Rather than risk another broken
illustration with no way to preview it visually, the hero and doctor sections now use plain,
reliable design elements (a glass-panel info card, a monogram avatar) built from CSS and the same
small icon set used throughout the site. Swap these for real photography as soon as it's available
— that will look better than either the illustration or the placeholder.

## 4. Multilingual support

The public site (Home, About, Services, Contact, Book OP, OP Confirmation, enquiry form, nav and
footer) is available in **English, Telugu, Tamil and Kannada** via a language switcher in the
header. All UI text lives in `frontend/src/i18n/locales/{en,te,ta,kn}.json` — one flat set of keys
per language, kept in sync (the build has no automated check for this, so if you add a key, add it
to all four files). The Telugu/Tamil/Kannada strings were machine-translated for this build; have a
native speaker review the clinical/medical wording before this goes live with real patients.

The admin dashboard (staff-only) is English-only by design — it's an internal tool, not
patient-facing.

Gender and blood-group dropdown *option values* (Male/Female/…, A+/B−/…) are intentionally left in
English in every language, since they're stored as literal values the backend and admin dashboard
both depend on — only their field labels are translated.

## 5. Patient photo: upload or live camera capture

The Book OP form's photo field supports both **uploading a file** and **taking a photo live** via
the device camera (`navigator.mediaDevices.getUserMedia`), landing in
`frontend/src/components/CameraCapture.tsx`. Camera capture requires HTTPS (or `localhost`) — browsers
block camera access on plain HTTP in production. A captured photo goes through the exact same
validation, upload and storage path as an uploaded file.

## 6. Database

Local development uses SQLite via Prisma (zero install). The schema
(`backend/prisma/schema.prisma`) is written to be PostgreSQL-compatible: for production, change
the `datasource` provider to `postgresql`, point `DATABASE_URL` at a real Postgres instance, and
run `npm run prisma:deploy`.

**Backups**: neither SQLite nor Postgres is backed up automatically by this project — set that up
at the infrastructure level. For SQLite, the entire database is the single file at `DATABASE_URL`
(`backend/prisma/dev.db` locally) plus `backend/uploads/patients/` for photos; a daily
`cp`/`rsync` of both to off-server storage (or a scheduled task/cron job) is enough for a clinic
this size. For Postgres in production, use your host's managed automated backups (or `pg_dump` on
a schedule) alongside the same photo-directory backup.

## 7. Security notes

- Admin auth uses bcrypt-hashed passwords and an httpOnly JWT session cookie (not localStorage).
- Patient photos are stored outside any public/static directory and are only served through an
  authenticated route (`GET /api/patients/:id/photo`), gated the same way as the rest of the admin API.
- All public form endpoints (Book OP, Enquiries, admin login) are rate-limited.
- Request bodies are validated server-side with Zod; the frontend's own validation is a UX layer
  only, never the source of truth.
- Secrets (`JWT_SECRET`, admin credentials, database URL) live in `backend/.env`, which is
  git-ignored — never hardcoded in source.
- `npm audit` currently reports a couple of moderate advisories against Vite/esbuild's **dev
  server only** (not present in the production build output). Run `npm audit` periodically and
  upgrade when a non-breaking fix is available.

## 8. Deployment

Deploy the frontend (static `vite build` output) and backend behind the **same origin** — e.g. a
reverse proxy that serves the built frontend and forwards `/api/*` to the Express server on the
same domain (this is what the Vite dev proxy simulates locally). The admin session cookie is
`httpOnly` + `SameSite=Lax`; browsers won't attach it to cross-origin `<img>` requests (used for
patient photos), so splitting frontend and backend across different domains without a shared
reverse proxy will break photo loading in the admin dashboard. Set `CORS_ORIGIN` in `backend/.env`
to the deployed site's origin, `NODE_ENV=production`, and serve everything over HTTPS.

## 9. Project structure

```
backend/src/
  config/       env loading, clinic constants
  db/           Prisma client singleton
  middleware/   auth, upload, rate limiting, error handling
  routes/       auth, appointments, enquiries, patients, dashboard
  services/     OP number generation, auth/password/JWT helpers
  utils/        Zod validation schemas

frontend/src/
  pages/        Home, About, Services, Location, Contact, BookOP, OPConfirmation, AdminLogin, AdminDashboard
  components/   Navbar, Footer, forms, admin panels, icon set, CameraCapture, LanguageSwitcher, DoctorAvatar
  utils/        clinicHours.ts — open/closed status and hours formatting for the Location page
  data/         services.data.ts — single source of truth for the Services content
  config/       clinicInfo.ts — single source of truth for contact details
  i18n/         locales/{en,te,ta,kn}.json — single source of truth for all public-site UI text
  api/          typed fetch wrappers per backend resource
```

## 10. What's deliberately out of scope for v1

Per the original brief: no billing, prescriptions, inventory or staff-management modules. The
admin dashboard covers appointments, patient records and enquiries only.
#   A r u n D e n t a l  
 #   A r u n D e n t a l  
 