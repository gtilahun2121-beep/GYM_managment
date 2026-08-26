# ============================================================================
# Gym Management System - Complete Initialization Script
# ============================================================================
# This script sets up the entire system from scratch
# Usage: .\init.ps1
# ============================================================================

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$text)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$text)
    Write-Host "  ✅ $text" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$text)
    Write-Host "  ❌ $text" -ForegroundColor Red
}

function Write-Info {
    param([string]$text)
    Write-Host "  ℹ️  $text" -ForegroundColor Yellow
}

# Start
Clear-Host
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║    🏋️  GYM MANAGEMENT SYSTEM - INITIALIZATION                ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║    This script will:                                           ║" -ForegroundColor Green
Write-Host "║    ✓ Verify prerequisites                                      ║" -ForegroundColor Green
Write-Host "║    ✓ Install dependencies                                      ║" -ForegroundColor Green
Write-Host "║    ✓ Create environment files                                  ║" -ForegroundColor Green
Write-Host "║    ✓ Setup database                                            ║" -ForegroundColor Green
Write-Host "║    ✓ Run migrations                                            ║" -ForegroundColor Green
Write-Host "║    ✓ Seed sample data                                          ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Step 1: Verify Prerequisites
Write-Header "STEP 1: Verifying Prerequisites"

# Check Node.js
Write-Info "Checking Node.js..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion found"
} catch {
    Write-Error-Custom "Node.js not found. Please install from https://nodejs.org/"
    exit 1
}

# Check npm
Write-Info "Checking npm..."
try {
    $npmVersion = npm --version
    Write-Success "npm $npmVersion found"
} catch {
    Write-Error-Custom "npm not found. Please install Node.js"
    exit 1
}

# Check if in correct directory
if (-not (Test-Path "c:\GYM\package.json")) {
    Write-Error-Custom "Not in c:\GYM directory. Please navigate to c:\GYM and try again"
    exit 1
}
Write-Success "Working directory is c:\GYM"

# Step 2: Install Dependencies
Write-Header "STEP 2: Installing Dependencies"
Write-Info "This may take a few minutes..."
try {
    npm install --legacy-peer-deps 2>&1 | Out-Null
    Write-Success "Dependencies installed"
} catch {
    Write-Error-Custom "Failed to install dependencies"
    exit 1
}

# Step 3: Create Environment Files
Write-Header "STEP 3: Creating Environment Files"

# Backend .env
Write-Info "Creating apps/api/.env..."
$backendEnv = @'
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=gym_db
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false

# JWT Configuration
JWT_SECRET=gym-management-secret-key-change-in-production-123456789
JWT_REFRESH_SECRET=gym-management-refresh-secret-key-change-in-production-987654321
JWT_EXPIRE_IN=15m

# Application
NODE_ENV=development
PORT=3000

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@gym.com
SMTP_FROM_NAME=Gym Management

# Stripe Configuration (Optional)
STRIPE_PUBLIC_KEY=pk_test_51234567890
STRIPE_SECRET_KEY=sk_test_0987654321

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Base URL
BASE_URL=http://localhost:3000
'@

$backendEnv | Set-Content "c:\GYM\apps\api\.env" -Encoding UTF8
Write-Success "Backend .env created"

# Frontend .env
Write-Info "Creating apps/web/.env..."
$frontendEnv = @'
# Frontend Environment Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Gym Management
VITE_APP_VERSION=1.0.0
VITE_ENV=development
'@

$frontendEnv | Set-Content "c:\GYM\apps\web\.env" -Encoding UTF8
Write-Success "Frontend .env created"

# Step 4: Database Check
Write-Header "STEP 4: Database Setup"

Write-Info "Checking PostgreSQL connection..."
$pgCheck = psql -U postgres -h localhost -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "PostgreSQL is running and accessible"
    
    # Check if database exists
    $dbCheck = psql -U postgres -h localhost -l 2>&1 | Select-String "gym_db"
    
    if ($dbCheck) {
        Write-Success "Database 'gym_db' already exists"
    } else {
        Write-Info "Creating database 'gym_db'..."
        psql -U postgres -h localhost -c "CREATE DATABASE gym_db;" 2>&1 | Out-Null
        Write-Success "Database 'gym_db' created"
    }
} else {
    Write-Error-Custom "PostgreSQL not found or not running"
    Write-Info "PostgreSQL must be installed and running. Options:"
    Write-Info "  1. Install PostgreSQL: https://www.postgresql.org/download/"
    Write-Info "  2. Or use Docker: docker-compose up -d"
    Write-Info ""
    Write-Info "After starting PostgreSQL, run this script again"
    exit 1
}

# Step 5: Run Migrations
Write-Header "STEP 5: Running Database Migrations"

Write-Info "Running migrations..."
try {
    cd "c:\GYM\apps\api"
    npm run db:migrate 2>&1 | Out-Null
    Write-Success "Migrations completed"
} catch {
    Write-Error-Custom "Migration failed"
    exit 1
}

# Step 6: Seed Database
Write-Header "STEP 6: Seeding Sample Data"

Write-Info "Do you want to seed the database with sample data? (y/n)"
$seed = Read-Host "Enter choice"

if ($seed -eq "y" -or $seed -eq "Y") {
    Write-Info "Seeding database..."
    try {
        npm run db:seed 2>&1 | Out-Null
        Write-Success "Database seeded with sample data"
        Write-Info "Sample credentials:"
        Write-Info "  Admin: admin@gym.com / password"
        Write-Info "  Manager: manager@gym.com / password"
        Write-Info "  Trainer: trainer@gym.com / password"
        Write-Info "  Member: member@gym.com / password"
    } catch {
        Write-Error-Custom "Seeding failed (optional, can continue)"
    }
}

cd "c:\GYM"

# Step 7: Summary
Write-Header "INITIALIZATION COMPLETE ✅"

Write-Success "All components initialized successfully!"
Write-Host ""
Write-Info "Next steps:"
Write-Info "  1. Start backend:  .\run.ps1 backend"
Write-Info "  2. Start frontend: .\run.ps1 frontend"
Write-Info "  3. Start all:      .\run.ps1 all"
Write-Info ""
Write-Info "Or use:"
Write-Info "  • .\dev.ps1        (Start everything)"
Write-Info ""
Write-Info "Frontend: http://localhost:5173"
Write-Info "Backend:  http://localhost:3000"
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
