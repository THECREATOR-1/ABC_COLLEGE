@echo off
echo ========================================
echo ABC Symposium Portal - Setup Script
echo ========================================

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Please install Node.js 18+ from https://nodejs.org
    exit /b 1
)

echo Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
if %ERRORLEVEL% NEQ 0 exit /b 1

echo Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install
if %ERRORLEVEL% NEQ 0 exit /b 1

echo Seeding database...
cd /d "%~dp0backend"
call npm run seed
if %ERRORLEVEL% NEQ 0 (
    echo Database seed failed. Ensure MySQL is running and credentials in backend/.env are correct.
)

echo.
echo Setup complete! Run start.bat to launch the application.
pause
