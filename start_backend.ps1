# EasyTravels — 1-Click Backend Launcher for Windows PowerShell
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Starting EasyTravels Django REST Framework Backend" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\backend"

# 1. Virtual Environment Setup
if (-not (Test-Path ".\venv\Scripts\Activate.ps1")) {
    Write-Host "[1/5] Creating Python virtual environment (venv)..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "[2/5] Activating virtual environment..." -ForegroundColor Green
& ".\venv\Scripts\Activate.ps1"

# 2. Dependencies
Write-Host "[3/5] Installing/verifying dependencies from requirements.txt..." -ForegroundColor Yellow
python -m pip install -r requirements.txt --quiet

# 3. Migrations
Write-Host "[4/5] Applying database migrations..." -ForegroundColor Yellow
python manage.py migrate --noinput
python manage.py loaddata fixtures\initial_seed.json

# 4. Start Server
Write-Host "[5/5] Launching Django development server on http://127.0.0.1:8000..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
python manage.py runserver 127.0.0.1:8000
