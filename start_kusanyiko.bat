@echo off
echo ========================================
echo  KUSANYIKO IP CONFIGURATION UPDATER
echo ========================================
echo.

:: Get current network IP
echo [1/4] Detecting current network IP...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4 Address" ^| findstr /v "127.0.0.1"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set NETWORK_IP=%%b
        goto :found_ip
    )
)

:found_ip
if "%NETWORK_IP%"=="" (
    echo ERROR: Could not detect network IP!
    echo Please ensure you are connected to a network.
    pause
    exit /b 1
)

echo    Current Network IP: %NETWORK_IP%
echo.

:: Update Django settings
echo [2/4] Updating Django CORS settings...
set DJANGO_SETTINGS=kusanyikoo\kusanyikoo\settings.py

:: Backup original settings
if not exist %DJANGO_SETTINGS%.backup (
    copy "%DJANGO_SETTINGS%" "%DJANGO_SETTINGS%.backup" >nul
    echo    Created backup of settings.py
)

:: Update ALLOWED_HOSTS
powershell -Command "(Get-Content '%DJANGO_SETTINGS%') -replace 'ALLOWED_HOSTS = .*', 'ALLOWED_HOSTS = [''localhost'', ''127.0.0.1'', ''%NETWORK_IP%'']' | Set-Content '%DJANGO_SETTINGS%'"

:: Update CORS_ALLOWED_ORIGINS
powershell -Command "(Get-Content '%DJANGO_SETTINGS%') -replace 'CORS_ALLOWED_ORIGINS = \[.*?\]', 'CORS_ALLOWED_ORIGINS = [    ''http://localhost:3000'',    ''http://127.0.0.1:3000'',    ''http://%NETWORK_IP%:3000'',]' | Set-Content '%DJANGO_SETTINGS%'"

echo    Django settings updated successfully!
echo.

:: Start Django server
echo [3/4] Starting Django server on all interfaces...
echo    Django will be accessible at:
echo    - http://localhost:8000 (local access)
echo    - http://%NETWORK_IP%:8000 (network access)
echo.
cd kusanyikoo
start "Django Server" cmd /k "python manage.py runserver 0.0.0.0:8000"
cd ..

:: Wait a moment for Django to start
timeout /t 3 /nobreak >nul

:: Start React development server
echo [4/4] Starting React development server...
echo    React will be accessible at:
echo    - http://localhost:3000 (local access)
echo    - http://%NETWORK_IP%:3000 (network access)
echo.
cd frontend
start "React Server" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo  SETUP COMPLETE!
echo ========================================
echo.
echo Your Kusanyiko application is now running and accessible from:
echo.
echo LOCAL ACCESS:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo.
echo NETWORK ACCESS (other devices):
echo   Frontend: http://%NETWORK_IP%:3000
echo   Backend:  http://%NETWORK_IP%:8000
echo.
echo INSTRUCTIONS:
echo 1. On this computer, use: http://localhost:3000
echo 2. On other devices (phones, tablets), use: http://%NETWORK_IP%:3000
echo 3. Make sure all devices are on the same WiFi network
echo 4. Check Windows Firewall if other devices can't connect
echo.
echo Press any key to exit...
pause >nul