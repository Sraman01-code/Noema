# Issue Log

This file records the concrete problems found in the repo and what was done about them.

## Fixed

| Issue | Status | Fix |
| --- | --- | --- |
| Frontend had two route trees, which made the real app entrypoint unclear. | Fixed | Removed the dead top-level route files and documented that `frontend/app/app/` is the actual Next.js app router. |
| `/` did not have a real page route. | Fixed | Added a root redirect to `/marketplace`. |
| Product cards linked to `/products/:id` but no detail page existed. | Fixed | Added `frontend/app/app/products/[id]/page.tsx`. |
| Seller login/guest flows redirected to `/seller`, but no seller page existed. | Fixed | Added `frontend/app/app/seller/page.tsx`. |
| Upload URLs were hardcoded to `localhost`. | Fixed | Backend now returns URLs based on the request base URL and the frontend upload widget can use `NEXT_PUBLIC_API_BASE_URL`. |
| Backend dependencies were missing from `requirements.txt`. | Fixed | Added FastAPI, Uvicorn, and `python-multipart`. |
| There was no single command to run both services. | Fixed | Added `run-dev.sh`. |
| There was no repo-level setup documentation. | Fixed | Added `README.md`. |

## Open

| Issue | Status | Notes |
| --- | --- | --- |
| `backend/app/api/auth.py` and `backend/app/api/products.py` are empty stubs. | Open | They are not wired into the running app yet. Keep them only if you plan to implement those endpoints. |
| Frontend persistence is browser-only. | Open | Data lives in `localStorage`, so it is not shared across devices or users. |
| `npm install` reports known vulnerabilities in the current dependency tree. | Open | The app still runs, but the dependency set should be reviewed and upgraded separately. |
