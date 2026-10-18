@echo off
title CalmConnect Launcher
echo ===================================================
echo   CalmConnect - Mental Health Platform Launcher
echo ===================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installing, double-click this file again.
    echo.
    pause
    exit /b 1
)

echo [1/2] Checking Server...
cd server
if not exist node_modules (
    echo Installing server dependencies (first time only)...
    call npm install
)
echo Starting Backend API on http://localhost:5001 ...
start "CalmConnect Backend API" cmd /k "npm run dev"

echo.
echo [2/2] Checking Frontend...
cd ..\client
if not exist node_modules (
    echo Installing frontend dependencies (first time only)...
    call npm install
)

echo.
echo Launching CalmConnect in your browser...
start http://localhost:5173
npm run dev
