# Kusanyiko Development Servers Startup Script
# PowerShell version with HTTPS support for mobile camera access

Write-Host "🌟 Starting Kusanyiko Development Servers" -ForegroundColor Green
Write-Host "=" * 50
Write-Host "📱 Mobile camera access enabled with HTTPS" -ForegroundColor Cyan
Write-Host "🌐 Frontend: https://10.181.172.168:3000" -ForegroundColor Yellow
Write-Host "🔧 Backend: http://10.181.172.168:8000" -ForegroundColor Yellow
Write-Host "=" * 50

# Start Django server in background
Write-Host "🚀 Starting Django backend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd kusanyikoo; python manage.py runserver 0.0.0.0:8000"

# Wait a moment for Django to start
Start-Sleep -Seconds 3

# Start React server with HTTPS
Write-Host "🚀 Starting React frontend server with HTTPS..." -ForegroundColor Blue
cd frontend
npm start

Write-Host "✅ Development servers started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Mobile Access Instructions:" -ForegroundColor Yellow
Write-Host "1. Connect your mobile device to the same Wi-Fi network"
Write-Host "2. Open browser and go to: https://10.181.172.168:3000"
Write-Host "3. Accept the security certificate warning (for development only)"
Write-Host "4. Camera access should now work properly!"
Write-Host ""
Write-Host "Press Ctrl+C to stop servers" -ForegroundColor Red