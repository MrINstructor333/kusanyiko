@echo off
echo ========================================
echo  KUSANYIKO IP CONFIGURATION UPDATER
echo ========================================
echo.

:: Get current network IP
echo [1/2] Detecting current network IP...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
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

set NETWORK_IP=%NETWORK_IP: =%
echo    Current Network IP: %NETWORK_IP%
echo.

:: Update Django settings
echo [2/2] Updating Django CORS and ALLOWED_HOSTS settings...
set DJANGO_SETTINGS=kusanyikoo\kusanyikoo\settings.py

:: Create a Python script to update settings
echo import re > update_settings.py
echo. >> update_settings.py
echo with open('%DJANGO_SETTINGS%', 'r') as f: >> update_settings.py
echo     content = f.read() >> update_settings.py
echo. >> update_settings.py
echo # Update ALLOWED_HOSTS >> update_settings.py
echo content = re.sub(r'ALLOWED_HOSTS = .*', "ALLOWED_HOSTS = ['localhost', '127.0.0.1', '%NETWORK_IP%']", content) >> update_settings.py
echo. >> update_settings.py
echo # Update CORS_ALLOWED_ORIGINS >> update_settings.py
echo cors_origins = '''CORS_ALLOWED_ORIGINS = [ >> update_settings.py
echo     'http://localhost:3000',  # React dev server >> update_settings.py
echo     'https://localhost:3000',  # React dev server HTTPS >> update_settings.py
echo     'http://127.0.0.1:3000',  # Loopback >> update_settings.py
echo     'https://127.0.0.1:3000',  # Loopback HTTPS >> update_settings.py
echo     'http://localhost:5173',  # Vite dev server (backup) >> update_settings.py
echo     'http://%NETWORK_IP%:3000',  # Current network IP >> update_settings.py
echo     'https://%NETWORK_IP%:3000',  # Current network IP HTTPS >> update_settings.py
echo ]''' >> update_settings.py
echo content = re.sub(r'CORS_ALLOWED_ORIGINS = \[.*?\]', cors_origins, content, flags=re.DOTALL) >> update_settings.py
echo. >> update_settings.py
echo with open('%DJANGO_SETTINGS%', 'w') as f: >> update_settings.py
echo     f.write(content) >> update_settings.py

python update_settings.py
del update_settings.py

echo    Django settings updated successfully!
echo.

echo ========================================
echo  CONFIGURATION COMPLETE!
echo ========================================
echo.
echo Your current network IP: %NETWORK_IP%
echo.
echo TO START THE SERVERS:
echo 1. Django Backend:
echo    cd kusanyikoo
echo    python manage.py runserver 0.0.0.0:8000
echo.
echo 2. React Frontend:
echo    cd frontend
echo    npm start
echo.
echo ACCESS URLS:
echo.
echo LOCAL ACCESS (this computer):
echo   Frontend: http://localhost:3000  ^(or https://localhost:3000 if using HTTPS dev server^)
echo   Backend:  http://localhost:8000
echo.
echo NETWORK ACCESS (other devices):
echo   Frontend: http://%NETWORK_IP%:3000  ^(or https://%NETWORK_IP%:3000 with HTTPS cert^)
echo   Backend:  http://%NETWORK_IP%:8000
echo.
echo NOTES:
echo - Ensure all devices are on the same WiFi network
echo - Check Windows Firewall if other devices can't connect
echo - The app will automatically detect the correct API endpoint
echo.
echo Press any key to exit...
pause >nul