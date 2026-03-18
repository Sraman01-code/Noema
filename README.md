# Noema

Noema is a local demo marketplace built with a FastAPI backend and a Next.js frontend.

## Quick Start

Run both services with one command:

```bash
./run-dev.sh
```

The script starts:

- Frontend: `http://127.0.0.1:3001` or `http://127.0.0.1:3000` if free
- Backend: `http://127.0.0.1:8000`

If you need to override the ports:

```bash
FRONTEND_PORT=3000 BACKEND_PORT=8000 ./run-dev.sh
```

## Manual Run

Backend:

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend/app
npm install
npm run dev -- -H 127.0.0.1 -p 3000
```

## Structure

- `backend/app/main.py` wires FastAPI, CORS, and static uploads.
- `backend/app/api/upload.py` handles image uploads and returns a local URL.
- `frontend/app/app/` contains the real Next.js app router.
- `frontend/app/components/` holds shared UI building blocks.
- `frontend/app/lib/` holds local storage helpers, auth state, and shared types.

## Routes

- `/` redirects to `/marketplace`
- `/marketplace` browses products
- `/auth` opens the guest-login entry point
- `/auth/login` and `/auth/signup` support full accounts
- `/buyer` shows the buyer dashboard
- `/seller` shows the seller dashboard
- `/products/[id]` shows product details

## Data Model

This project is demo-first and stores state in the browser.

- Users, auth sessions, cart contents, and purchase history are persisted in `localStorage`.
- Products are persisted in `localStorage` through `frontend/app/lib/productStore.ts`.
- Uploaded images are written to `backend/uploads/product-images/`.

## Notes For Contributors

- The app router lives under `frontend/app/app/`; the old top-level route tree was removed to avoid confusion.
- If you deploy this outside local development, set `NEXT_PUBLIC_API_BASE_URL` for the upload widget.
- The backend is currently storage-light; there is no database migration layer yet.
