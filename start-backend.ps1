# Gym Management System - Backend Startup Script
# Usage: .\start-backend.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Gym Management System - Backend Startup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Starting Backend Server..." -ForegroundColor Green
Write-Host "   API will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   Docs at: http://localhost:3000/api/docs" -ForegroundColor Yellow
Write-Host ""

Write-Host "⏳ Starting NestJS development server..." -ForegroundColor Cyan
cd "$PSScriptRoot\apps\api"
npm run dev
