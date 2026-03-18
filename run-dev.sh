#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

PYTHON_BIN="${PYTHON_BIN:-python3}"
VENV_DIR="$ROOT_DIR/backend/.venv"

if [ ! -d "$VENV_DIR" ]; then
  echo "Creating backend virtual environment..."
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

BACKEND_PY="$VENV_DIR/bin/python"

echo "Installing backend dependencies..."
"$BACKEND_PY" -m pip install -r "$ROOT_DIR/backend/requirements.txt"

echo "Installing frontend dependencies..."
(cd "$ROOT_DIR/frontend/app" && npm install)

is_port_in_use() {
  (echo >"/dev/tcp/127.0.0.1/$1") >/dev/null 2>&1
}

BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

if is_port_in_use "$FRONTEND_PORT"; then
  echo "Port $FRONTEND_PORT is already in use. Falling back to 3001."
  FRONTEND_PORT=3001
fi

echo "Starting backend on http://$BACKEND_HOST:$BACKEND_PORT ..."
(cd "$ROOT_DIR/backend" && "$BACKEND_PY" -m uvicorn app.main:app --reload --host "$BACKEND_HOST" --port "$BACKEND_PORT") &
BACKEND_PID=$!

echo "Starting frontend on http://$FRONTEND_HOST:$FRONTEND_PORT ..."
(cd "$ROOT_DIR/frontend/app" && npm run dev -- -H "$FRONTEND_HOST" -p "$FRONTEND_PORT") &
FRONTEND_PID=$!

cleanup() {
  echo "Shutting down..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

echo "Frontend: http://$FRONTEND_HOST:$FRONTEND_PORT"
echo "Backend:  http://$BACKEND_HOST:$BACKEND_PORT"
echo "Press Ctrl+C to stop."

wait
