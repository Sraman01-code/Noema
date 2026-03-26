@echo off
setlocal

REM Windows dev runner for Noema.
REM Starts backend and frontend in separate terminal windows.
REM
REM Backend:
REM   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
REM Frontend:
REM   npm run dev -- -H 127.0.0.1 -p 3000

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend\app"

set "BACKEND_HOST=127.0.0.1"
set "BACKEND_PORT=8000"
set "FRONTEND_HOST=127.0.0.1"
set "FRONTEND_PORT=3000"
set "API_BASE_URL=http://%BACKEND_HOST%:%BACKEND_PORT%"

echo Checking backend dependencies...
pushd "%BACKEND_DIR%"
set "BACKEND_RUN_CMD="

REM 1. Prefer a working project virtualenv if it can already run uvicorn.
if exist "%BACKEND_DIR%\.venv\Scripts\python.exe" (
  call "%BACKEND_DIR%\.venv\Scripts\python.exe" -m uvicorn --version >nul 2>nul
  if not errorlevel 1 (
    set "BACKEND_RUN_CMD=""%BACKEND_DIR%\.venv\Scripts\python.exe"" -m uvicorn"
  ) else (
    echo Project virtualenv exists but cannot run uvicorn. Skipping it...
  )
)

REM 2. Fall back to the Python launcher if uvicorn is available there.
if not defined BACKEND_RUN_CMD (
  where py >nul 2>nul
  if not errorlevel 1 (
    py -3 -m uvicorn --version >nul 2>nul
    if not errorlevel 1 (
      set "BACKEND_RUN_CMD=py -3 -m uvicorn"
    )
  )
)

REM 3. Last fallback: plain python on PATH.
if not defined BACKEND_RUN_CMD (
  python -m uvicorn --version >nul 2>nul
  if not errorlevel 1 (
    set "BACKEND_RUN_CMD=python -m uvicorn"
  )
)
popd

if not defined BACKEND_RUN_CMD (
  echo Could not find a working Python that can run uvicorn.
  echo.
  echo Fix one of these and run the script again:
  echo   1. backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
  echo   2. py -3 -m pip install -r backend\requirements.txt
  echo.
  pause
  exit /b 1
)

echo Starting backend in a new terminal...
start "Noema Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && %BACKEND_RUN_CMD% app.main:app --reload --host %BACKEND_HOST% --port %BACKEND_PORT%"

echo Starting frontend in a new terminal...
start "Noema Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && set NEXT_PUBLIC_API_BASE_URL=%API_BASE_URL% && npm run dev -- -H %FRONTEND_HOST% -p %FRONTEND_PORT%"

echo.
echo Backend:  http://%BACKEND_HOST%:%BACKEND_PORT%
echo Frontend: http://%FRONTEND_HOST%:%FRONTEND_PORT%
echo.
echo Close the opened terminal windows to stop the dev servers.

endlocal
