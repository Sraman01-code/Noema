# Noema

Noema is a small local demo marketplace built with:

- FastAPI for a minimal backend
- Next.js 14 for the frontend
- browser `localStorage` for most app data

It is best understood as a frontend-first demo app with a thin backend used mainly for image uploads.

## What The Project Does

The app supports two roles:

- `buyer`: browse products, add to cart, buy, review products, view purchase history
- `seller`: upload a product image, create listings, manage personal listings

The main user flows are:

- guest login for quick demo access
- account signup/login for persistent local users
- seller listing creation
- buyer checkout and receipt generation

## Current Architecture

This project does **not** use a real shared database yet.

Current storage model:

- Users, sessions, cart, balances: stored in browser `localStorage`
- Products: stored in browser `localStorage`
- Reviews and purchase history: stored in browser `localStorage`
- Uploaded images: stored on disk under `backend/uploads/product-images`

Backend responsibilities today:

- accept image uploads at `/api/upload`
- serve uploaded files from `/uploads/...`

Frontend responsibilities today:

- all auth logic
- all marketplace state
- all cart and checkout logic
- all review/history behavior

## Tech Stack

### Frontend

- Next.js 14
- React 18
- Tailwind CSS
- `lucide-react`
- `qrcode.react`
- `html2canvas`
- `jspdf`

### Backend

- FastAPI
- Uvicorn
- `python-multipart`

## Project Layout

```text
Noema/
├─ backend/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ auth.py
│  │  │  ├─ products.py
│  │  │  └─ upload.py
│  │  ├─ core/
│  │  └─ main.py
│  ├─ requirements.txt
│  └─ uploads/
├─ frontend/
│  └─ app/
│     ├─ app/
│     ├─ components/
│     ├─ lib/
│     ├─ public/
│     └─ package.json
├─ docs/
├─ run-dev.bat
├─ run-dev.sh
└─ CODEX_SUMMARY.md
```

Important folders:

- `backend/app/main.py`: FastAPI app setup, CORS, router mounting, static uploads
- `backend/app/api/upload.py`: image upload endpoint
- `frontend/app/app/`: Next.js app router pages
- `frontend/app/components/`: shared UI
- `frontend/app/lib/`: auth, product store, money helpers, shared types

## Routes

- `/`: redirects to `/marketplace`
- `/marketplace`: product browsing
- `/auth`: guest access entry page
- `/auth/login`: local login
- `/auth/signup`: local signup
- `/buyer`: buyer dashboard
- `/seller`: seller dashboard
- `/products/[id]`: product detail page

## Running The Project

The expected local ports are:

- Frontend: `http://127.0.0.1:3000`
- Backend: `http://127.0.0.1:8000`

### Windows Quick Start

Use the repo-level batch script:

```bat
run-dev.bat
```

What it does:

- starts backend in one terminal window
- starts frontend in another terminal window
- sets `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`

If the script says it cannot find a Python that can run `uvicorn`, install backend requirements manually:

```bat
cd backend
py -3 -m pip install -r requirements.txt
cd ..
run-dev.bat
```

### Windows Manual Run

Backend:

```powershell
cd backend
py -3 -m pip install -r requirements.txt
py -3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd frontend/app
npm install
$env:NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8000"
npm run dev -- -H 127.0.0.1 -p 3000
```

### Bash / WSL / Git Bash

There is also a Unix-style runner:

```bash
./run-dev.sh
```

## Environment Notes

- The app is designed for local development.
- Frontend and backend are expected to run on `3000` and `8000`.
- Backend CORS is configured for frontend ports `3000` and `3001`.
- A modern browser with `localStorage` support is required.
- `crypto.randomUUID()` is used in the frontend.

## What Is Working

- guest login flow
- local signup/login flow
- buyer dashboard
- seller dashboard
- seller image upload
- local checkout flow
- product detail pages
- route-level frontend navigation

## Known Limitations

These are current project constraints, not setup mistakes:

- most app data is local to one browser profile
- there is no real shared backend persistence
- backend auth and products APIs are still stubs
- this is not production-grade auth/security
- some older component files remain in the repo but are not part of the main running flow

## Good First Reading Order

If you are new to the repo, start here:

1. `README.md`
2. `frontend/app/app/layout.tsx`
3. `frontend/app/lib/auth.tsx`
4. `frontend/app/lib/productStore.ts`
5. `frontend/app/app/marketplace/page.tsx`
6. `frontend/app/app/buyer/page.tsx`
7. `frontend/app/app/seller/page.tsx`
8. `backend/app/main.py`
9. `backend/app/api/upload.py`

## Repo Notes

- `run-dev.bat` is the Windows-first dev runner.
- `run-dev.sh` is the Unix-style runner.
- `CODEX_SUMMARY.md` contains a deeper repo-understanding report for this mini project.

## License

This repository includes an MIT [LICENSE](LICENSE).
