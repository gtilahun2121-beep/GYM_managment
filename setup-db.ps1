# Gym Management System - Database Setup Script
# Usage: .\setup-db.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🗄️  Database Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Prerequisites:" -ForegroundColor Green
Write-Host "   ✓ PostgreSQL must be installed and running" -ForegroundColor White
Write-Host "   ✓ Default: localhost:5432, user: postgres, password: postgres" -ForegroundColor White
Write-Host ""

$dbHost = Read-Host "Enter database host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Enter database port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }

$dbUser = Read-Host "Enter database user (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "Enter database password (default: postgres)" -AsSecureString
$dbPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($dbPassword))
if ([string]::IsNullOrWhiteSpace($dbPasswordPlain)) { $dbPasswordPlain = "postgres" }

$dbName = Read-Host "Enter database name (default: gym_db)"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "gym_db" }

Write-Host ""
Write-Host "🔧 Updating .env file..." -ForegroundColor Cyan

# Update backend .env
$envFile = "$PSScriptRoot\apps\api\.env"
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    $content = $content -replace 'DATABASE_HOST=.*', "DATABASE_HOST=$dbHost"
    $content = $content -replace 'DATABASE_PORT=.*', "DATABASE_PORT=$dbPort"
    $content = $content -replace 'DATABASE_USER=.*', "DATABASE_USER=$dbUser"
    $content = $content -replace 'DATABASE_PASSWORD=.*', "DATABASE_PASSWORD=$dbPasswordPlain"
    $content = $content -replace 'DATABASE_NAME=.*', "DATABASE_NAME=$dbName"
    $content | Set-Content $envFile
    Write-Host "   ✓ .env file updated" -ForegroundColor Green
} else {
    Write-Host "   ✗ .env file not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Running migrations..." -ForegroundColor Cyan

cd "$PSScriptRoot\apps\api"
npm run db:migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Optionally, seed database with sample data?" -ForegroundColor Yellow
    $seed = Read-Host "Run seed script? (y/n, default: y)"
    if ($seed -ne "n") {
        Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
        npm run db:seed
        Write-Host "✅ Database seeded!" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host "   Check your database connection settings" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: .\start-backend.ps1" -ForegroundColor White
Write-Host "  2. In another terminal: .\start-frontend.ps1" -ForegroundColor White
Write-Host ""
