# ============================================================================
# Gym Management System - Docker Setup & Launch
# ============================================================================
# This script sets up and runs the entire system using Docker
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   🐳 GYM MANAGEMENT SYSTEM - DOCKER SETUP & LAUNCH       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Check if Docker is installed
Write-Host "🔍 Checking Docker installation..." -ForegroundColor Cyan
$dockerCheck = docker --version 2>$null
if ($dockerCheck) {
    Write-Host "✅ Docker is installed: $dockerCheck" -ForegroundColor Green
} else {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔍 Checking Docker Compose..." -ForegroundColor Cyan
$composeCheck = docker-compose --version 2>$null
if ($composeCheck) {
    Write-Host "✅ Docker Compose is installed: $composeCheck" -ForegroundColor Green
} else {
    Write-Host "❌ Docker Compose is not installed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 SETUP OPTIONS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "  1. Start fresh (rebuild all containers)" -ForegroundColor White
Write-Host "  2. Resume existing (start running containers)" -ForegroundColor White
Write-Host "  3. Stop containers" -ForegroundColor White
Write-Host "  4. Remove everything (clean slate)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select option (1-4)"

Write-Host ""

switch ($choice) {
    "1" {
        Write-Host "🔨 Building and starting fresh..." -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "Stopping existing containers..." -ForegroundColor Yellow
        docker-compose down -v 2>$null
        
        Write-Host "Building Docker images..." -ForegroundColor Yellow
        docker-compose build --no-cache
        
        Write-Host ""
        Write-Host "Starting all services..." -ForegroundColor Yellow
        docker-compose up -d
        
        Write-Host ""
        Write-Host "⏳ Waiting for services to start (30 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host ""
        Write-Host "🔍 Checking container status..." -ForegroundColor Cyan
        docker-compose ps
    }
    
    "2" {
        Write-Host "▶️ Starting existing containers..." -ForegroundColor Cyan
        docker-compose up -d
        
        Write-Host ""
        Write-Host "⏳ Waiting for services to start (10 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host ""
        Write-Host "🔍 Container status:" -ForegroundColor Cyan
        docker-compose ps
    }
    
    "3" {
        Write-Host "⏹️ Stopping containers..." -ForegroundColor Cyan
        docker-compose stop
        
        Write-Host ""
        Write-Host "✅ All containers stopped" -ForegroundColor Green
        docker-compose ps
    }
    
    "4" {
        Write-Host "🗑️ Removing all containers and volumes..." -ForegroundColor Red
        Write-Host "⚠️  This will delete all data!" -ForegroundColor Yellow
        
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -eq "yes") {
            docker-compose down -v
            Write-Host "✅ Everything removed" -ForegroundColor Green
        } else {
            Write-Host "❌ Cancelled" -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

if ($choice -eq "1" -or $choice -eq "2") {
    Write-Host "✅ SYSTEM STATUS" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "📍 Service Endpoints:" -ForegroundColor Cyan
    Write-Host "   Frontend:   http://localhost:3001" -ForegroundColor Magenta
    Write-Host "   Backend:    http://localhost:3000" -ForegroundColor Magenta
    Write-Host "   Database:   localhost:5432" -ForegroundColor Magenta
    Write-Host "   Redis:      localhost:6379" -ForegroundColor Magenta
    Write-Host ""
    
    Write-Host "🔑 Database Credentials:" -ForegroundColor Cyan
    Write-Host "   User:       gym_admin" -ForegroundColor White
    Write-Host "   Password:   password" -ForegroundColor White
    Write-Host "   Database:   gym_system" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📊 Running Containers:" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host ""
    Write-Host "💡 Useful Commands:" -ForegroundColor Yellow
    Write-Host "   View logs:        docker-compose logs -f" -ForegroundColor White
    Write-Host "   Backend logs:     docker-compose logs -f api" -ForegroundColor White
    Write-Host "   Frontend logs:    docker-compose logs -f web" -ForegroundColor White
    Write-Host "   Database logs:    docker-compose logs -f postgres" -ForegroundColor White
    Write-Host "   Stop all:         docker-compose stop" -ForegroundColor White
    Write-Host "   Start all:        docker-compose up -d" -ForegroundColor White
    Write-Host "   Remove all:       docker-compose down -v" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Open http://localhost:3001 in your browser" -ForegroundColor White
    Write-Host "   2. Sign up or log in" -ForegroundColor White
    Write-Host "   3. Test the system" -ForegroundColor White
    Write-Host ""
}

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
