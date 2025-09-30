@echo off
echo ========================================
echo  TESTING KUSANYIKO APP SETUP
echo ========================================
echo.

echo [1/3] Testing Django Backend...
curl -s http://localhost:8000/api/health/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Django backend is running on http://localhost:8000
) else (
    echo ❌ Django backend is not responding
    echo Please start the Django server with: python manage.py runserver 0.0.0.0:8000
)

echo.
echo [2/3] Testing React Frontend...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ React frontend is running on http://localhost:3000
) else (
    echo ❌ React frontend is not responding
    echo Please start the React server with: npm start
)

echo.
echo [3/3] Testing API Proxy...
curl -s http://localhost:3000/api/health/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Proxy is working correctly
) else (
    echo ❌ Proxy is not working
    echo Make sure both servers are running
)

echo.
echo ========================================
echo  TEST COMPLETE
echo ========================================
echo.
echo If all tests pass, your app should work without console errors.
echo.
pause