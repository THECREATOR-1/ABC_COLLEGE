@echo off
echo Starting ABC Symposium Portal...

start "Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo Services Started:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   Admin:    admin / admin123
echo ========================================
