@echo off
title LawLens - Starting All Services...
color 0b
echo ========================================================
echo       Starting LawLens Legal Intelligence Platform
echo ========================================================
echo.

:: 1. Check and Start MariaDB (XAMPP)
echo [1/3] Checking MariaDB Database...
netstat -ano | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo MariaDB is not running. Starting XAMPP MariaDB...
    start "" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
    timeout /t 3 /nobreak >nul
) else (
    echo MariaDB is already running on port 3306.
)

:: 2. Check and Start FastAPI Backend Server
echo [2/3] Starting LawLens Backend (FastAPI on Port 8000)...
netstat -ano | findstr :8000 >nul
if %errorlevel% neq 0 (
    start "LawLens Backend Server" cmd /k "cd /d "%~dp0backend" && (if exist venv\Scripts\Activate.bat (call venv\Scripts\Activate.bat) else (echo Running with system Python...)) && uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
    timeout /t 3 /nobreak >nul
) else (
    echo Backend is already running on port 8000.
)

:: 3. Check and Start React Frontend Server
echo [3/3] Starting LawLens Frontend (React Vite on Port 5173)...
netstat -ano | findstr :5173 >nul
if %errorlevel% neq 0 (
    start "LawLens Frontend UI" cmd /k "cd /d "%~dp0frontend" && npm run dev"
    timeout /t 3 /nobreak >nul
) else (
    echo Frontend is already running on port 5173.
)


:: 4. Launch Default Browser to LawLens
echo.
echo ========================================================
echo  LawLens is RUNNING! Opening platform in your browser...
echo ========================================================
start http://localhost:5173

timeout /t 4 >nul
exit
