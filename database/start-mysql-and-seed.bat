@echo off
echo Starting XAMPP MySQL...
if exist "C:\xampp\mysql_start.bat" (
    call "C:\xampp\mysql_start.bat"
    echo MySQL start initiated via XAMPP.
    timeout /t 5 /nobreak >nul
) else (
    echo XAMPP not found at C:\xampp
    echo Install XAMPP from https://www.apachefriends.org/
    echo Or start your MySQL service manually.
    exit /b 1
)

echo Seeding database...
cd /d "%~dp0backend"
call npm run seed
if %ERRORLEVEL% NEQ 0 exit /b 1

echo Database ready!
