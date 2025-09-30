@echo off
echo ========================================
echo  KUSANYIKO DEVELOPMENT SERVER STARTER
echo ========================================
echo.

echo Starting Django backend on port 8000...
start "Django Backend" cmd /k "cd /d C:\Users\MAXFYNN\Desktop\kusanyiko\kusanyikoo && C:\Users\MAXFYNN\Desktop\kusanyiko\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting React frontend on port 3000...
start "React Frontend" cmd /k "cd /d C:\Users\MAXFYNN\Desktop\kusanyiko\frontend && npm start"

echo.
echo ========================================
echo  SERVERS STARTING...
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Note: The frontend will automatically proxy API requests to the backend.
echo Both server windows will open separately.
echo.
echo Press any key to exit this script...
pause >nul