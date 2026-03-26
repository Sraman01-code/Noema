# CODEX Summary

## Architecture summary

Noema is a local demo marketplace with:

- Frontend: Next.js 14 app router under `frontend/app/app`
- Backend: FastAPI under `backend/app`
- Data model: mostly browser `localStorage`, not a real shared backend
- Backend responsibility today: image upload only

Current source of truth is split:

- Auth/session/cart/balance live in `localStorage` via `frontend/app/lib/auth.tsx`
- Products live in `localStorage` via `frontend/app/lib/productStore.ts`
- Reviews and purchase history also live in `localStorage`
- Uploaded images are written to `backend/uploads/product-images`

That means the frontend behaves like a standalone browser demo, while the backend is only used for seller image uploads.

## Folder structure

### Repo root

- `.gitignore`: ignores frontend build output, Python venv, and uploaded images
- `README.md`: main setup and route notes, but assumes bash
- `run-dev.sh`: one-command dev runner for bash shells only
- `backend.txt`: older backend tree sketch, partially stale
- `frontend.txt`: older frontend tree sketch, stale in multiple places
- `docs/issue-log.md`: previous issue log, partly outdated now

### `backend/`

- `requirements.txt`: FastAPI, Uvicorn, `python-multipart`
- `app/main.py`: creates FastAPI app, adds CORS, mounts upload router, serves `/uploads`
- `app/api/upload.py`: accepts an uploaded image and returns a local URL
- `app/api/auth.py`: empty stub
- `app/api/products.py`: empty stub
- `app/core/config.py`: empty stub
- `app/core/security.py`: empty stub
- `app/core/storage.py`: empty stub
- `uploads/product-images/`: runtime upload directory; one sample uploaded file is currently committed

### `frontend/app/`

- `package.json`: Next.js app scripts and dependencies
- `package-lock.json`: npm lockfile
- `tsconfig.json`: TS config with `@/*` path alias
- `next.config.js`: Next config with `reactStrictMode`
- `tailwind.config.ts`, `postcss.config.js`: Tailwind/PostCSS setup
- `next-env.d.ts`: Next generated TS types

### `frontend/app/app/`

- `layout.tsx`: global layout, imports `globals.css`, wraps app in `AuthProvider`, renders `NavBar`
- `globals.css`: global styling and shared visual utility classes
- `page.tsx`: redirects `/` to `/marketplace`
- `marketplace/page.tsx`: public product grid with search and buyer actions
- `products/[id]/page.tsx`: product detail page
- `auth/page.tsx`: guest entry page plus links to login/signup
- `auth/login/page.tsx`: email/password login page
- `auth/signup/page.tsx`: email/password registration page
- `buyer/page.tsx`: buyer dashboard, cart, checkout, reviews, history, receipt PDF
- `seller/page.tsx`: seller dashboard, image upload, listing creation, listing deletion

### `frontend/app/components/`

- `NavBar.tsx`: top navigation and logout action
- `ProductCard.tsx`: reusable product tile linking to `/products/[id]`
- `UploadDropzone.tsx`: uploads seller images to FastAPI
- `AttributeEditor.tsx`: seller-side listing edit form
- `PurchaseModal.tsx`: quantity picker for purchase flow
- `ReviewList.tsx`: review renderer with sort selector
- `SearchBar.tsx`: reusable search input, currently unused
- `SecurityBadge.tsx`: unused
- `ProductPreview.tsx`: unused older seller-preview component
- `ProductReviews.tsx`: unused older review component
- `ReviewForm.tsx`: unused older review form
- `BillingPage.tsx`: unused receipt page component, not routed
- `ActionBar.tsx`: unused older seller action bar
- `CategoryBreadcrumb.tsx`: unused breadcrumb component
- `FilterPanel.tsx`: empty file
- `RoleBadge.tsx`: wrong file contents; currently contains another upload component instead of a role badge

### `frontend/app/lib/`

- `auth.tsx`: auth context, registration, login, guest login, cart, checkout, deposit
- `productStore.ts`: local product store backed by `localStorage`
- `types.ts`: shared product/user/review types
- `money.ts`: display formatting helpers
- `mockData.ts`: seed products and reviews
- `search.ts`: unused search helper
- `api.ts`: fake analysis/pricing helpers, unused

### `frontend/app/public/assets/`

- `shoes.jpg`, `jacket.jpg`, `laptop.jpg`: mock product images

## Frontend flow

1. App boot:
   - `layout.tsx` wraps everything in `AuthProvider`
   - `AuthProvider` hydrates `auth_user` from `localStorage`
   - `NavBar` renders based on current user state

2. Public browsing:
   - `/` redirects to `/marketplace`
   - `/marketplace` loads products from `products_db` in `localStorage`
   - If there is no stored product data, `mockProducts` seed the store
   - Buyers can add items to cart or open a buy-now modal

3. Auth:
   - `/auth` offers guest buyer/guest seller buttons plus login/signup links
   - `/auth/login` checks credentials against `users_db`
   - `/auth/signup` creates a local account in `users_db`

4. Seller flow:
   - `/seller` requires a seller user
   - Seller uploads an image through FastAPI `/api/upload`
   - Seller edits listing fields in `AttributeEditor`
   - Clicking Publish saves the listing into browser `products_db`

5. Buyer flow:
   - `/buyer` requires a buyer user
   - Buyer sees all products from `products_db`
   - Buyer can add to cart, buy now, review products, checkout, and view local purchase history
   - Receipt modal can export a PDF using `html2canvas` and `jspdf`

## Backend flow

1. `backend/app/main.py` creates the FastAPI app.
2. CORS only allows `http://localhost:3000` and `http://127.0.0.1:3000`.
3. `/api/upload` accepts an uploaded image file.
4. Uploaded files are written to `backend/uploads/product-images/`.
5. The backend returns a public local URL under `/uploads/product-images/...`.
6. StaticFiles serves `/uploads`.

There is no real backend auth flow, no products API, no persistence layer, and no database.

## How the app is supposed to run

Intended local-dev shape:

- Backend on `127.0.0.1:8000`
- Frontend on `127.0.0.1:3000`
- Seller image uploads call the backend
- Everything else runs in-browser from `localStorage`

Important constraint:

- The current backend CORS config only supports frontend port `3000`
- The README/run script mention a possible fallback to `3001`, but uploads will fail there until CORS is updated

## Run steps

Use PowerShell on Windows:

### Backend

```powershell
cd C:\Users\srama\Noema\backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

Open a second PowerShell window:

```powershell
cd C:\Users\srama\Noema\frontend\app
npm install
$env:NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8000"
npm run dev -- -H 127.0.0.1 -p 3000
```

If you have Git Bash or WSL, the repo also intends this:

```bash
./run-dev.sh
```

But `run-dev.sh` is not directly usable in native PowerShell.

## Dependencies and environment assumptions

### Backend

- Python 3.x
- FastAPI
- Uvicorn
- `python-multipart`

### Frontend

- Node.js
- npm
- Next.js 14
- React 18
- Tailwind CSS
- `lucide-react`
- `qrcode.react`
- `html2canvas`
- `jspdf`
- `bcryptjs` is declared but not actually used

### Runtime assumptions

- A modern browser with `localStorage`
- Browser support for `crypto.randomUUID()`
- Frontend can reach backend at `NEXT_PUBLIC_API_BASE_URL` or `http://127.0.0.1:8000`
- Local dev should stay on port `3000` until CORS is fixed

## Issues found

### High impact

1. Guest login flow does not navigate anywhere.
   - `frontend/app/app/auth/page.tsx` creates guest users, but the redirect effect explicitly skips guests.
   - Result: guest buyer/seller buttons do not take the user into the intended demo flow.

2. Registered user state is not persisted back into `users_db`.
   - `frontend/app/lib/auth.tsx` updates only `auth_user` during cart changes, deposit, and checkout.
   - After logout/login, a registered user can lose updated balance/cart state.

3. Seller dashboard is not scoped to the current seller.
   - `frontend/app/app/seller/page.tsx` loads all products from shared `products_db`.
   - Delete also removes any product by id, regardless of owner.

4. Backend CORS conflicts with the documented frontend port fallback.
   - `backend/app/main.py` only allows port `3000`.
   - `README.md` and `run-dev.sh` allow frontend port `3001`.
   - Uploads break if frontend runs on `3001`.

5. Guest checkout policy conflicts with demo-mode UX.
   - `/auth` invites instant guest use.
   - `checkout()` blocks guest users from completing purchase.
   - Marketplace and buyer UI still expose purchase actions to guests.

### Medium impact

6. Backend is mostly unfinished.
   - `backend/app/api/auth.py`, `backend/app/api/products.py`, and all files in `backend/app/core/` are empty stubs.

7. Several frontend components are stale or orphaned.
   - `FilterPanel.tsx` is empty.
   - `RoleBadge.tsx` contains the wrong component implementation.
   - `BillingPage.tsx`, `ProductPreview.tsx`, `ProductReviews.tsx`, `ReviewForm.tsx`, `ActionBar.tsx`, `SearchBar.tsx`, `SecurityBadge.tsx`, `CategoryBreadcrumb.tsx`, `search.ts`, and `api.ts` are unused in the live route flow.

8. Docs and structure notes are partially stale.
   - `frontend.txt` references folders/files that do not exist anymore.
   - `backend.txt` references folders not present in the actual tree.

9. Browser-only persistence is the real app architecture.
   - Products, auth, cart, reviews, and purchase history are all local to one browser profile.
   - There is no shared state between devices or users.

### Lower impact

10. Runtime artifacts are in the repo.
   - `backend/uploads/product-images/...` includes an uploaded file even though uploads are listed in `.gitignore`.

11. Auth security is demo-grade only.
   - Passwords are reversibly transformed with `btoa(reverse(password))`.
   - `bcryptjs` is installed but unused.

12. Navbar flow is incomplete for buyers.
   - There is no buyer dashboard link in `NavBar.tsx`.
   - This makes the guest buyer problem worse.

## Fix plan

### Priority 1: make the demo usable fast

1. Fix guest login redirects.
   - Send guest buyers to `/buyer`
   - Send guest sellers to `/seller`

2. Fix local user persistence.
   - When cart/balance/session state changes for registered users, also update `users_db`

3. Keep frontend on `3000` for now or expand CORS to include `3001`
   - Fastest safe fix is to add `3001` to `ALLOWED_ORIGINS`

4. Scope seller listings to `sellerId`
   - Only show and delete the current seller's own products

### Priority 2: clean the broken project edges

5. Decide the intended guest policy
   - Either allow guest checkout for demo mode
   - Or disable purchase/checkout actions for guests and message that clearly

6. Remove or repair stale files
   - Fix `RoleBadge.tsx`
   - Remove empty `FilterPanel.tsx` or implement it
   - Remove unused legacy components if they are no longer part of the plan

7. Make docs match reality
   - Update README for Windows and PowerShell
   - Replace or delete stale `frontend.txt` and `backend.txt`

### Priority 3: clarify architecture

8. Decide whether products/auth should stay frontend-only or move to FastAPI
9. If backend ownership is desired, implement real `/api/products` and `/api/auth`
10. Add a proper persistence layer if this should be more than a browser demo

## Questions for you

1. Should guest users be able to complete purchases, or should guest mode be browse-only?
2. Do you want products/auth to remain browser-only for now, or should I move the core flows into FastAPI?
3. Is Windows PowerShell an official target environment, or should the project stay bash-first?
