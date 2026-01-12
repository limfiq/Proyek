@echo off
REM Script to install Apache and MySQL from XAMPP as Windows Services
REM Run this as Administrator

echo.
echo ====================================
echo XAMPP Services Installation
echo ====================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

setlocal enabledelayedexpansion

set XAMPP_PATH=E:\xampp
set APACHE_PATH=%XAMPP_PATH%\apache
set MYSQL_PATH=%XAMPP_PATH%\mysql

echo Checking XAMPP installation...
if not exist "%XAMPP_PATH%" (
    echo ERROR: XAMPP not found at %XAMPP_PATH%
    pause
    exit /b 1
)

echo.
echo ====================================
echo 1. Installing Apache as Service
echo ====================================
echo.

REM Check if Apache is already installed as service
sc query ApacheXAMPP >nul 2>&1
if %errorLevel% equ 0 (
    echo Apache service already exists. Removing it first...
    net stop ApacheXAMPP 2>nul
    "%APACHE_PATH%\bin\httpd.exe" -k uninstall -n "ApacheXAMPP" 2>nul
    timeout /t 2
)

REM Install Apache as service
echo Installing Apache as service...
cd /d "%APACHE_PATH%\bin"
httpd.exe -k install -n "ApacheXAMPP"

if %errorLevel% equ 0 (
    echo Apache installed successfully!
    REM Start Apache service
    echo Starting Apache service...
    net start ApacheXAMPP
) else (
    echo ERROR: Failed to install Apache service
    pause
    exit /b 1
)

echo.
echo ====================================
echo 2. Installing MySQL as Service
echo ====================================
echo.

REM Find MySQL directory
for /d %%i in ("%MYSQL_PATH%") do set MYSQL_BIN=%%i\bin

REM Check if MySQL is already installed as service
sc query MySQL80 >nul 2>&1
if %errorLevel% equ 0 (
    echo MySQL service already exists. Removing it first...
    net stop MySQL80 2>nul
    "%MYSQL_BIN%\mysqld.exe" --remove 2>nul
    timeout /t 2
)

REM Install MySQL as service
echo Installing MySQL as service...
cd /d "%MYSQL_BIN%"
mysqld.exe --install MySQL80 --defaults-file="%XAMPP_PATH%\mysql\bin\my.ini"

if %errorLevel% equ 0 (
    echo MySQL installed successfully!
    REM Start MySQL service
    echo Starting MySQL service...
    net start MySQL80
) else (
    echo ERROR: Failed to install MySQL service
    pause
    exit /b 1
)

echo.
echo ====================================
echo Installation Complete!
echo ====================================
echo.
echo Services installed:
echo - ApacheXAMPP (Apache Web Server)
echo - MySQL80 (MySQL Database)
echo.
echo Both services will start automatically on Windows startup.
echo.
echo To verify services:
echo   - Open Services (services.msc)
echo   - Look for "ApacheXAMPP" and "MySQL80"
echo.
echo To manage services manually:
echo   - Start: net start ApacheXAMPP / net start MySQL80
echo   - Stop: net stop ApacheXAMPP / net stop MySQL80
echo.
pause
