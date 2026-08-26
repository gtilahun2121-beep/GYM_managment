# Gym Management System - Complete System Startup Script
# Usage: .\start-all.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Gym Management System - Full Stack" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  IMPORTANT SETUP REQUIREMENTS:" -ForegroundColor Yellow
Write-Host "   1. PostgreSQL must be running on localhost:5432" -ForegroundColor White
Write-Host "   2. Database connection details in apps/api/.env" -ForegroundColor White
Write-Host "   3. Run migrations: cd apps/api && npm run db:migrate" -ForegroundColor White
Write-Host ""

Write-Host "📋 Configuration:" -ForegroundColor Green
Write-Host "   Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔄 This script will open TWO new terminals:" -ForegroundColor Magenta
Write-Host "   - Terminal 1: Backend (NestJS) on port 3000" -ForegroundColor White
Write-Host "   - Terminal 2: Frontend (React) on port 5173" -ForegroundColor White
Write-Host ""

$scriptPath = $PSScriptRoot

Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; & '.\start-backend.ps1'"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; & '.\start-frontend.ps1'"

Write-Host ""
Write-Host "✅ Startup scripts launched!" -ForegroundColor Green
Write-Host "   Watch for both terminals to confirm servers started successfully" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Once both are running, visit:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3000" -ForegroundColor White
Write-Host ""
