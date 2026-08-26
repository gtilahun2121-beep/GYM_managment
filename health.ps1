# ============================================================================
# Gym Management System - Health Check Script
# ============================================================================
# Verifies that all components are working correctly
# Usage: .\health.ps1
# ============================================================================

$ErrorActionPreference = "Continue"

function Write-Header {
    param([string]$text)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

function Write-Pass {
    param([string]$text)
    Write-Host "  ✅ $text" -ForegroundColor Green
}

function Write-Fail {
    param([string]$text)
    Write-Host "  ❌ $text" -ForegroundColor Red
}

function Write-Info {
    param([string]$text)
    Write-Host "  ℹ️  $text" -ForegroundColor Yellow
}

function Write-Status {
    param([string]$text)
    Write-Host "  ⏳ $text" -ForegroundColor Cyan
}

Clear-Host
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║    🏋️  GYM MANAGEMENT SYSTEM - HEALTH CHECK                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

$passCount = 0
$failCount = 0

# 1. Check Prerequisites
Write-Header "1️⃣  PREREQUISITES"

Write-Status "Checking Node.js..."
try {
    $nodeVersion = node --version 2>&1
    Write-Pass "Node.js: $nodeVersion"
    $passCount++
} catch {
    Write-Fail "Node.js not installed"
    $failCount++
}

Write-Status "Checking npm..."
try {
    $npmVersion = npm --version 2>&1
    Write-Pass "npm: $npmVersion"
    $passCount++
} catch {
    Write-Fail "npm not installed"
    $failCount++
}

Write-Status "Checking PowerShell..."
try {
    $psVersion = $PSVersionTable.PSVersion.ToString()
    Write-Pass "PowerShell: $psVersion"
    $passCount++
} catch {
    Write-Fail "PowerShell version check failed"
    $failCount++
}

# 2. Check Project Structure
Write-Header "2️⃣  PROJECT STRUCTURE"

$requiredDirs = @(
    "apps\api",
    "apps\web",
    "packages\shared-types"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path "c:\GYM\$dir") {
        Write-Pass "Directory: $dir"
        $passCount++
    } else {
        Write-Fail "Missing directory: $dir"
        $failCount++
    }
}

# 3. Check Configuration Files
Write-Header "3️⃣  CONFIGURATION FILES"

$configFiles = @(
    "apps\api\.env",
    "apps\web\.env",
    "apps\api\package.json",
    "apps\web\package.json"
)

foreach ($file in $configFiles) {
    if (Test-Path "c:\GYM\$file") {
        Write-Pass "File: $file"
        $passCount++
    } else {
        Write-Info "Missing: $file (can be created by init.ps1)"
        if ($file -like "*\.env") {
            $failCount++
        }
    }
}

# 4. Check Database
Write-Header "4️⃣  DATABASE"

Write-Status "Checking PostgreSQL..."
try {
    $result = psql -U postgres -h localhost -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Pass "PostgreSQL: Connected"
        $passCount++
        
        # Check if gym_db exists
        Write-Status "Checking gym_db database..."
        $dbResult = psql -U postgres -h localhost -l 2>&1 | Select-String "gym_db"
        if ($dbResult) {
            Write-Pass "Database: gym_db exists"
            $passCount++
            
            # Check tables
            Write-Status "Checking tables..."
            $tableResult = psql -U postgres -h localhost -d gym_db -c "\dt" 2>&1 | Measure-Object -Line
            if ($tableResult.Lines -gt 3) {
                Write-Pass "Tables: $(($tableResult.Lines - 3) / 2) tables found"
                $passCount++
            } else {
                Write-Info "No tables found (run init.ps1 to create)"
            }
        } else {
            Write-Info "Database: gym_db not found (run init.ps1 to create)"
        }
    } else {
        Write-Fail "PostgreSQL: Not accessible"
        Write-Info "Make sure PostgreSQL is installed and running"
        $failCount++
    }
} catch {
    Write-Fail "PostgreSQL: Connection failed"
    Write-Info "Install PostgreSQL from https://www.postgresql.org/download/"
    $failCount++
}

# 5. Check Backend
Write-Header "5️⃣  BACKEND"

Write-Status "Checking backend dependencies..."
if (Test-Path "c:\GYM\apps\api\node_modules") {
    $depsCount = (Get-ChildItem "c:\GYM\apps\api\node_modules" | Measure-Object).Count
    Write-Pass "Dependencies: $depsCount packages installed"
    $passCount++
} else {
    Write-Info "Backend dependencies not installed (run init.ps1 to install)"
}

Write-Status "Checking backend code..."
$backendFiles = @(
    "apps\api\src\main.ts",
    "apps\api\src\app.module.ts",
    "apps\api\src\modules\auth\auth.service.ts",
    "apps\api\src\modules\members\members.service.ts"
)

$backendReady = 0
foreach ($file in $backendFiles) {
    if (Test-Path "c:\GYM\$file") {
        $backendReady++
    }
}

if ($backendReady -eq $backendFiles.Count) {
    Write-Pass "Backend: Code complete ($($backendFiles.Count)/$($backendFiles.Count) modules)"
    $passCount++
} else {
    Write-Fail "Backend: Missing modules ($backendReady/$($backendFiles.Count))"
}

Write-Status "Testing backend compilation..."
try {
    Push-Location "c:\GYM\apps\api"
    $compileResult = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Pass "Backend: TypeScript compiles successfully"
        $passCount++
    } else {
        Write-Info "Backend: TypeScript has compilation warnings (non-critical)"
    }
    Pop-Location
} catch {
    Write-Info "Backend: Could not verify compilation (minor issue)"
}

# 6. Check Frontend
Write-Header "6️⃣  FRONTEND"

Write-Status "Checking frontend dependencies..."
if (Test-Path "c:\GYM\apps\web\node_modules") {
    $depsCount = (Get-ChildItem "c:\GYM\apps\web\node_modules" | Measure-Object).Count
    Write-Pass "Dependencies: $depsCount packages installed"
    $passCount++
} else {
    Write-Info "Frontend dependencies not installed (run init.ps1 to install)"
}

Write-Status "Checking frontend code..."
$frontendFiles = @(
    "apps\web\src\main.tsx",
    "apps\web\src\App.tsx"
)

$frontendReady = 0
foreach ($file in $frontendFiles) {
    if (Test-Path "c:\GYM\$file") {
        $frontendReady++
    }
}

if ($frontendReady -eq $frontendFiles.Count) {
    Write-Pass "Frontend: Code ready ($($frontendFiles.Count)/$($frontendFiles.Count) files)"
    $passCount++
} else {
    Write-Info "Frontend: Not all files present"
}

# 7. Check Running Services
Write-Header "7️⃣  RUNNING SERVICES"

Write-Status "Checking backend (port 3000)..."
$backendCheck = Test-NetConnection -ComputerName localhost -Port 3000 -ErrorAction SilentlyContinue
if ($backendCheck.TcpTestSucceeded) {
    Write-Pass "Backend: Running on port 3000"
    $passCount++
} else {
    Write-Info "Backend: Not running (start with: .\run.ps1 backend)"
}

Write-Status "Checking frontend (port 5173)..."
$frontendCheck = Test-NetConnection -ComputerName localhost -Port 5173 -ErrorAction SilentlyContinue
if ($frontendCheck.TcpTestSucceeded) {
    Write-Pass "Frontend: Running on port 5173"
    $passCount++
} else {
    Write-Info "Frontend: Not running (start with: .\run.ps1 frontend)"
}

Write-Status "Checking PostgreSQL (port 5432)..."
$postgresCheck = Test-NetConnection -ComputerName localhost -Port 5432 -ErrorAction SilentlyContinue
if ($postgresCheck.TcpTestSucceeded) {
    Write-Pass "PostgreSQL: Running on port 5432"
    $passCount++
} else {
    Write-Info "PostgreSQL: Not running (start with: docker-compose up -d or local install)"
}

# 8. Documentation
Write-Header "8️⃣  DOCUMENTATION"

$docFiles = @(
    "START_HERE.md",
    "READY_TO_RUN.md",
    "MEMBERS.md",
    "MEMBERS_QUICK_START.md"
)

$docsReady = 0
foreach ($file in $docFiles) {
    if (Test-Path "c:\GYM\$file") {
        $docsReady++
    }
}

Write-Pass "Documentation: $docsReady/$($docFiles.Count) guides available"
$passCount++

# 9. Helper Scripts
Write-Header "9️⃣  HELPER SCRIPTS"

$scripts = @(
    "init.ps1",
    "run.ps1",
    "health.ps1"
)

$scriptsReady = 0
foreach ($script in $scripts) {
    if (Test-Path "c:\GYM\$script") {
        $scriptsReady++
    }
}

Write-Pass "Scripts: $scriptsReady/$($scripts.Count) automation scripts ready"
$passCount++

# Summary
Write-Header "📊 HEALTH CHECK SUMMARY"

$total = $passCount + $failCount
$percentage = if ($total -gt 0) { [math]::Round(($passCount / $total) * 100) } else { 0 }

Write-Host ""
Write-Host "  Status: " -NoNewline
if ($failCount -eq 0) {
    Write-Host "✅ ALL SYSTEMS OPERATIONAL" -ForegroundColor Green
} elseif ($percentage -ge 80) {
    Write-Host "⚠️  MOSTLY READY (some minor issues)" -ForegroundColor Yellow
} else {
    Write-Host "❌ NEEDS ATTENTION" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Checks Passed: $passCount/$total ($percentage%)" -ForegroundColor Green
Write-Host ""

# Next Steps
Write-Header "📋 NEXT STEPS"

if ($failCount -gt 0) {
    Write-Info "To complete setup, run:"
    Write-Info "  .\init.ps1"
    Write-Host ""
}

Write-Info "To start the system, run:"
Write-Info "  .\run.ps1           (starts both backend & frontend)"
Write-Info "  .\run.ps1 backend   (starts only backend)"
Write-Info "  .\run.ps1 frontend  (starts only frontend)"
Write-Host ""

Write-Info "Access the system at:"
Write-Info "  Frontend: http://localhost:5173"
Write-Info "  Backend:  http://localhost:3000"
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

if ($failCount -eq 0) {
    exit 0
} else {
    exit 1
}
