# ============================================================================
# Gym Management System - Smart Startup Script
# ============================================================================
# Usage:
#   .\run.ps1              (starts everything)
#   .\run.ps1 backend      (starts only backend)
#   .\run.ps1 frontend     (starts only frontend)
#   .\run.ps1 init         (runs initialization)
# ============================================================================

param(
    [string]$Mode = "all"
)

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

function Write-Info {
    param([string]$text)
    Write-Host "  ℹ️  $text" -ForegroundColor Yellow
}

# Verify we're in the right directory
if (-not (Test-Path "c:\GYM\package.json")) {
    Write-Host "Error: Must run from c:\GYM directory" -ForegroundColor Red
    exit 1
}

# Mode selection
switch ($Mode.ToLower()) {
    "backend" {
        Write-Header "🚀 Starting Backend Server"
        Write-Info "Backend running on: http://localhost:3000"
        Write-Info "API Docs: http://localhost:3000/api/docs"
        Write-Info "Press Ctrl+C to stop"
        Write-Host ""
        
        cd "c:\GYM\apps\api"
        npm run dev
        exit 0
    }
    
    "frontend" {
        Write-Header "🚀 Starting Frontend Server"
        Write-Info "Frontend running on: http://localhost:5173"
        Write-Info "Press Ctrl+C to stop"
        Write-Host ""
        
        cd "c:\GYM\apps\web"
        npm run dev
        exit 0
    }
    
    "init" {
        Write-Header "🔧 Initialization"
        & "c:\GYM\init.ps1"
        exit 0
    }
    
    "all" {
        Write-Header "🏋️  Gym Management System - Full Stack"
        
        # Check if initialized
        if (-not (Test-Path "c:\GYM\apps\api\.env")) {
            Write-Info "System not initialized. Running init.ps1..."
            & "c:\GYM\init.ps1"
            if ($LASTEXITCODE -ne 0) {
                exit 1
            }
        }
        
        Write-Info "Starting both backend and frontend..."
        Write-Info "Opening new terminals..."
        Write-Host ""
        
        # Start backend in new window
        Write-Info "Launching backend terminal..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\GYM'; & '.\run.ps1' backend" -WindowStyle Normal
        
        Start-Sleep -Seconds 2
        
        # Start frontend in new window
        Write-Info "Launching frontend terminal..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\GYM'; & '.\run.ps1' frontend" -WindowStyle Normal
        
        Write-Header "✅ Servers Started"
        Write-Info "Frontend: http://localhost:5173"
        Write-Info "Backend:  http://localhost:3000"
        Write-Info ""
        Write-Info "Check the new terminal windows to see server output"
        Write-Host ""
        
        exit 0
    }
    
    default {
        Write-Host "Usage:" -ForegroundColor Cyan
        Write-Host "  .\run.ps1           Start everything (backend + frontend)" -ForegroundColor White
        Write-Host "  .\run.ps1 backend   Start only backend server" -ForegroundColor White
        Write-Host "  .\run.ps1 frontend  Start only frontend server" -ForegroundColor White
        Write-Host "  .\run.ps1 init      Run initialization" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}
