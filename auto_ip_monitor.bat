@echo off
setlocal enabledelayedexpansion
:: Auto IP Monitor - Runs in background to detect IP changes
:: This script can be run as a scheduled task or startup item

echo ========================================
echo  KUSANYIKO AUTO IP MONITOR STARTED
echo ========================================
echo Started at: %date% %time%
echo.

:monitor_loop
:: Wait 30 seconds between checks
timeout /t 30 /nobreak >nul

:: Get current network IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set CURRENT_IP=%%b
        goto :found_ip
    )
)

:found_ip
if "!CURRENT_IP!"=="" (
    set CURRENT_IP=localhost
)
set CURRENT_IP=!CURRENT_IP: =!

:: Check if IP has changed
set STORED_IP=
if exist "current_ip.txt" (
    set /p STORED_IP=<current_ip.txt
)

if not "!CURRENT_IP!"=="!STORED_IP!" (
    echo [%date% %time%] IP Changed: !STORED_IP! -^> !CURRENT_IP!
    
    :: Run the main update script silently
    call update_ip_config.bat >nul 2>&1
    
    if !errorlevel! EQU 0 (
        echo [%date% %time%] Configuration updated successfully
    ) else (
        echo [%date% %time%] Configuration update failed
    )
)

goto :monitor_loop