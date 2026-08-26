# ============================================================================
# Gym Management System - Troubleshooting Script
# ============================================================================
# Diagnoses and fixes common issues
# Usage: .\troubleshoot.ps1
# ============================================================================

$ErrorActionPreference = "Continue"

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

function Write-Warning-Custom {
    param([string]$text)
    Write-Host "  ⚠️  $text" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$text)
    Write-Host "  ℹ️  $text" -ForegroundColor Yellow
}

function Write-Fix {
    param([string]$text)
    Write-Host "  🔧 $text" -ForegroundColor Magenta
}

function Ask-YesNo {
    param([string]$prompt)
    $response = Read-Host "$prompt (y/n)"
    return $response -eq "y" -or $response -eq "Y"
}

Clear-Host
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║    🏋️  GYM MANAGEMENT SYSTEM - TROUBLESHOOTING                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Info "This script will diagnose and help fix common issues."
Write-Info ""
Write-Info "Common problems:"
Write-Info "  • Port already in use"
Write-Info "  • Database connection failed"
Write-Info "  • Dependencies not installed"
Write-Info "  • Module not found errors"
Write-Info "  • Services won't start"
Write-Info ""

# Menu
Write-Header "SELECT AN ISSUE"

Write-Host "  1. Port 3000 (backend) already in use" -ForegroundColor White
Write-Host "  2. Port 5173 (frontend) already in use" -ForegroundColor White
Write-Host "  3. Port 5432 (PostgreSQL) already in use" -ForegroundColor White
Write-Host "  4. Cannot connect to database" -ForegroundColor White
Write-Host "  5. Node.js or npm not found" -ForegroundColor White
Write-Host "  6. Dependencies/modules missing" -ForegroundColor White
Write-Host "  7. Backend won't start" -ForegroundColor White
Write-Host "  8. Frontend won't start" -ForegroundColor White
Write-Host "  9. Full system reset" -ForegroundColor White
Write-Host "  10. Run full diagnostics" -ForegroundColor White
Write-Host "  0. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter option (0-10)"

switch ($choice) {
    # Port 3000
    "1" {
        Write-Header "FIXING: Port 3000 (Backend) Already in Use"
        
        Write-Warning-Custom "Port 3000 is already in use"
        Write-Info "Attempting to find and kill the process..."
        
        try {
            $process = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Handles -like "*" } | ForEach-Object {
                $ports = (Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq 3000 -and $_.OwningProcess -eq $_.Id })
                if ($ports) { $_ }
            }
            
            $port3000 = netstat -ano | findstr :3000
            if ($port3000) {
                $pid = $port3000.Split()[-1]
                Write-Info "Found process: PID $pid"
                
                if (Ask-YesNo "Kill this process?") {
                    taskkill /PID $pid /F
                    Start-Sleep -Seconds 1
                    Write-Success "Process killed successfully"
                    Write-Info "Port 3000 should now be available"
                    Write-Fix "Try: .\run.ps1 backend"
                }
            } else {
                Write-Success "Port 3000 is now free"
            }
        } catch {
            Write-Error-Custom "Could not determine process. Manual fix required:"
            Write-Fix "  netstat -ano | findstr :3000"
            Write-Fix "  taskkill /PID <PID> /F"
        }
    }
    
    # Port 5173
    "2" {
        Write-Header "FIXING: Port 5173 (Frontend) Already in Use"
        
        Write-Warning-Custom "Port 5173 is already in use"
        Write-Info "Attempting to find and kill the process..."
        
        try {
            $port5173 = netstat -ano | findstr :5173
            if ($port5173) {
                $pid = $port5173.Split()[-1]
                Write-Info "Found process: PID $pid"
                
                if (Ask-YesNo "Kill this process?") {
                    taskkill /PID $pid /F
                    Start-Sleep -Seconds 1
                    Write-Success "Process killed successfully"
                    Write-Info "Port 5173 should now be available"
                    Write-Fix "Try: .\run.ps1 frontend"
                }
            } else {
                Write-Success "Port 5173 is now free"
            }
        } catch {
            Write-Error-Custom "Could not determine process"
        }
    }
    
    # Port 5432
    "3" {
        Write-Header "FIXING: Port 5432 (PostgreSQL) Already in Use"
        
        Write-Warning-Custom "Port 5432 is already in use"
        Write-Info "This is usually PostgreSQL or a Docker container"
        Write-Info ""
        Write-Info "Options:"
        Write-Info "  1. PostgreSQL is already running (good!)"
        Write-Info "  2. Docker container is running"
        Write-Info "  3. Something else is using the port"
        Write-Info ""
        
        Write-Fix "Try:"
        Write-Fix "  psql -U postgres -h localhost -c \"SELECT 1;\""
        Write-Fix "  If it connects, PostgreSQL is running correctly"
        Write-Fix ""
        Write-Fix "If using Docker:"
        Write-Fix "  docker-compose down"
        Write-Fix "  Then restart"
        Write-Fix ""
        Write-Fix "To find what's using the port:"
        Write-Fix "  netstat -ano | findstr :5432"
        Write-Fix "  taskkill /PID <PID> /F"
    }
    
    # Database connection
    "4" {
        Write-Header "FIXING: Cannot Connect to Database"
        
        Write-Warning-Custom "Database connection failed"
        Write-Info "Testing PostgreSQL connection..."
        Write-Info ""
        
        Write-Fix "Step 1: Is PostgreSQL running?"
        try {
            $result = psql -U postgres -h localhost -c "SELECT version();" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "PostgreSQL is running and accessible"
                Write-Info ""
                Write-Fix "Step 2: Does database 'gym_db' exist?"
                $dbCheck = psql -U postgres -h localhost -l 2>&1 | Select-String "gym_db"
                if ($dbCheck) {
                    Write-Success "Database exists"
                    Write-Info ""
                    Write-Fix "Step 3: Check environment variables in apps/api/.env"
                    Write-Info "  DATABASE_HOST=localhost"
                    Write-Info "  DATABASE_PORT=5432"
                    Write-Info "  DATABASE_USER=postgres"
                    Write-Info "  DATABASE_PASSWORD=postgres"
                    Write-Info "  DATABASE_NAME=gym_db"
                } else {
                    Write-Error-Custom "Database 'gym_db' not found"
                    Write-Fix "Create it with: psql -U postgres -h localhost -c \"CREATE DATABASE gym_db;\""
                    Write-Fix "Then run: .\init.ps1"
                }
            } else {
                Write-Error-Custom "PostgreSQL is not accessible"
                Write-Fix "Make sure PostgreSQL is installed and running"
                Write-Fix "Test with: psql -U postgres -h localhost"
            }
        } catch {
            Write-Error-Custom "PostgreSQL command failed"
            Write-Fix "Install PostgreSQL from: https://www.postgresql.org/download/"
        }
    }
    
    # Node.js/npm
    "5" {
        Write-Header "FIXING: Node.js or npm Not Found"
        
        Write-Error-Custom "Node.js or npm is not installed"
        Write-Info ""
        Write-Fix "Solution:"
        Write-Fix "  1. Download Node.js LTS from: https://nodejs.org/"
        Write-Fix "  2. Run the installer"
        Write-Fix "  3. Follow the installation wizard"
        Write-Fix "  4. Restart PowerShell"
        Write-Fix "  5. Verify: node --version && npm --version"
        Write-Info ""
        Write-Info "After installation, run:"
        Write-Fix "  .\init.ps1"
    }
    
    # Dependencies
    "6" {
        Write-Header "FIXING: Dependencies/Modules Missing"
        
        Write-Warning-Custom "Module dependencies not found"
        Write-Info "Reinstalling all dependencies..."
        Write-Info ""
        
        Write-Info "This may take several minutes..."
        Write-Info ""
        
        try {
            Write-Fix "Installing root dependencies..."
            npm install --legacy-peer-deps 2>&1 | Out-Null
            Write-Success "Root dependencies installed"
            
            Write-Fix "Installing backend dependencies..."
            Push-Location "c:\GYM\apps\api"
            npm install 2>&1 | Out-Null
            Write-Success "Backend dependencies installed"
            Pop-Location
            
            Write-Fix "Installing frontend dependencies..."
            Push-Location "c:\GYM\apps\web"
            npm install 2>&1 | Out-Null
            Write-Success "Frontend dependencies installed"
            Pop-Location
            
            Write-Success "All dependencies installed successfully"
            Write-Fix "Try: .\run.ps1"
        } catch {
            Write-Error-Custom "Installation failed"
            Write-Fix "Try running each manually:"
            Write-Fix "  cd c:\GYM && npm install --legacy-peer-deps"
            Write-Fix "  cd c:\GYM\apps\api && npm install"
            Write-Fix "  cd c:\GYM\apps\web && npm install"
        }
    }
    
    # Backend won't start
    "7" {
        Write-Header "FIXING: Backend Won't Start"
        
        Write-Warning-Custom "Backend server failed to start"
        Write-Info "Checking common issues..."
        Write-Info ""
        
        Write-Fix "1. Check if port 3000 is free:"
        $port3000 = netstat -ano | findstr :3000
        if ($port3000) {
            Write-Error-Custom "  Port 3000 is already in use"
            Write-Fix "  Kill the process: taskkill /PID <PID> /F"
        } else {
            Write-Success "  Port 3000 is free"
        }
        
        Write-Fix "2. Check database connection:"
        try {
            $result = psql -U postgres -h localhost -c "SELECT 1;" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "  Database is accessible"
            } else {
                Write-Error-Custom "  Cannot connect to database"
            }
        } catch {
            Write-Error-Custom "  Database check failed"
        }
        
        Write-Fix "3. Check environment file:"
        if (Test-Path "c:\GYM\apps\api\.env") {
            Write-Success "  .env file exists"
        } else {
            Write-Error-Custom "  .env file missing"
            Write-Fix "  Run: .\init.ps1"
        }
        
        Write-Fix "4. Check code compilation:"
        Push-Location "c:\GYM\apps\api"
        $compile = npx tsc --noEmit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "  Code compiles successfully"
        } else {
            Write-Warning-Custom "  Code has compilation warnings"
        }
        Pop-Location
        
        Write-Info ""
        Write-Fix "Try: .\run.ps1 backend"
        Write-Fix "And check the output for specific errors"
    }
    
    # Frontend won't start
    "8" {
        Write-Header "FIXING: Frontend Won't Start"
        
        Write-Warning-Custom "Frontend server failed to start"
        Write-Info "Checking common issues..."
        Write-Info ""
        
        Write-Fix "1. Check if port 5173 is free:"
        $port5173 = netstat -ano | findstr :5173
        if ($port5173) {
            Write-Error-Custom "  Port 5173 is already in use"
            Write-Fix "  Kill the process: taskkill /PID <PID> /F"
        } else {
            Write-Success "  Port 5173 is free"
        }
        
        Write-Fix "2. Check environment file:"
        if (Test-Path "c:\GYM\apps\web\.env") {
            Write-Success "  .env file exists"
        } else {
            Write-Error-Custom "  .env file missing"
            Write-Fix "  Run: .\init.ps1"
        }
        
        Write-Fix "3. Check dependencies:"
        if (Test-Path "c:\GYM\apps\web\node_modules") {
            Write-Success "  Dependencies installed"
        } else {
            Write-Error-Custom "  Dependencies missing"
            Write-Fix "  Run: .\troubleshoot.ps1"
            Write-Fix "  Select option 6"
        }
        
        Write-Info ""
        Write-Fix "Try: .\run.ps1 frontend"
        Write-Fix "And check the output for specific errors"
    }
    
    # Full reset
    "9" {
        Write-Header "FULL SYSTEM RESET"
        
        Write-Warning-Custom "This will reset everything to initial state"
        Write-Info "Your database data WILL BE LOST"
        Write-Info ""
        
        if (Ask-YesNo "Are you sure you want to reset everything?") {
            Write-Info ""
            Write-Fix "Backing up environment files..."
            Copy-Item "c:\GYM\apps\api\.env" "c:\GYM\apps\api\.env.backup" -ErrorAction SilentlyContinue
            Copy-Item "c:\GYM\apps\web\.env" "c:\GYM\apps\web\.env.backup" -ErrorAction SilentlyContinue
            Write-Success "Backups created"
            
            Write-Fix "Cleaning node_modules..."
            Remove-Item "c:\GYM\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
            Remove-Item "c:\GYM\apps\api\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
            Remove-Item "c:\GYM\apps\web\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "Cleaned"
            
            Write-Fix "Reinstalling everything..."
            Write-Info ""
            & "c:\GYM\init.ps1"
            
            Write-Success "System reset complete"
            Write-Fix "Try: .\run.ps1"
        }
    }
    
    # Full diagnostics
    "10" {
        Write-Header "RUNNING FULL DIAGNOSTICS"
        Write-Info "Running comprehensive system check..."
        Write-Info ""
        
        & "c:\GYM\health.ps1"
    }
    
    # Exit
    "0" {
        Write-Info "Exiting troubleshooter"
        exit 0
    }
    
    default {
        Write-Error-Custom "Invalid option"
        exit 1
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Info "If issues persist, check:"
Write-Info "  • GET_STARTED.md - Setup guide"
Write-Info "  • SETUP_CHECKLIST.md - Detailed troubleshooting"
Write-Info "  • READY_TO_RUN.md - Full documentation"
Write-Info ""
Write-Fix "Run health check: .\health.ps1"
Write-Host ""
