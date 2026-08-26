# Gym Management System - Frontend Startup Script
# Usage: .\start-frontend.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Gym Management System - Frontend Startup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Starting Frontend Server..." -ForegroundColor Green
Write-Host "   Frontend will be available at: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""

Write-Host "⏳ Starting React development server..." -ForegroundColor Cyan
cd "$PSScriptRoot\apps\web"
npm run dev
