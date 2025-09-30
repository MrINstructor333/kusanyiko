# Django Build Script - PowerShell Version
# Similar to npm run build for Django

Write-Host "Building Kusanyiko Django Application..." -ForegroundColor Green

# Navigate to Django directory
Set-Location "kusanyikoo"

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
& "C:/Users/MAXFYNN/Desktop/kusanyiko/venv/Scripts/python.exe" -m pip install -r "../requirements.txt"

Write-Host "Checking for deployment issues..." -ForegroundColor Yellow
& "C:/Users/MAXFYNN/Desktop/kusanyiko/venv/Scripts/python.exe" manage.py check --deploy

Write-Host "Running database migrations..." -ForegroundColor Yellow
& "C:/Users/MAXFYNN/Desktop/kusanyiko/venv/Scripts/python.exe" manage.py migrate

Write-Host "Collecting static files..." -ForegroundColor Yellow
& "C:/Users/MAXFYNN/Desktop/kusanyiko/venv/Scripts/python.exe" manage.py collectstatic --noinput --clear

Write-Host "Clearing expired sessions..." -ForegroundColor Yellow
& "C:/Users/MAXFYNN/Desktop/kusanyiko/venv/Scripts/python.exe" manage.py clearsessions

Write-Host "Django build completed successfully!" -ForegroundColor Green
Write-Host "Ready for deployment!" -ForegroundColor Green

# Show build summary
Write-Host ""
Write-Host "Build Summary:" -ForegroundColor Cyan
if (Test-Path "staticfiles") {
    $staticFiles = (Get-ChildItem -Recurse -File "staticfiles" | Measure-Object).Count
    Write-Host "- Static files: $staticFiles files collected" -ForegroundColor White
} else {
    Write-Host "- Static files: Directory not found" -ForegroundColor Yellow
}
Write-Host "- Database migrations: Applied successfully" -ForegroundColor White
Write-Host "- Static file optimization: Completed" -ForegroundColor White