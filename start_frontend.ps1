# EasyTravels — 1-Click Frontend Launcher for Windows PowerShell
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Starting EasyTravels React + Vite Frontend" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot"

# 1. Check node_modules
if (-not (Test-Path ".\node_modules")) {
    Write-Host "[1/2] Installing npm packages from package.json..." -ForegroundColor Yellow
    npm install
}

# 2. Launch Dev Server
Write-Host "[2/2] Launching Vite dev server on http://localhost:3000..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
npm run dev
