# Development Script for Next.js Webapp
# Usage: .\scripts\dev.ps1 [command]
# Commands: test, build, dev, lint, clean, all

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Colors for output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue
$Cyan = [System.ConsoleColor]::Cyan

function Write-ColorText {
    param([string]$Text, [System.ConsoleColor]$Color = [System.ConsoleColor]::White)
    Write-Host $Text -ForegroundColor $Color
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-ColorText "=" * 60 -Color $Cyan
    Write-ColorText "  $Title" -Color $Cyan
    Write-ColorText "=" * 60 -Color $Cyan
    Write-Host ""
}

function Test-Command {
    param([string]$CommandName)
    try {
        Get-Command $CommandName -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Run-Tests {
    Write-Section "Running Unit Tests"
    Write-ColorText "Running unit tests with Vitest..." -Color $Blue
    
    try {
        pnpm test:unit
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✓ Unit tests passed!" -Color $Green
        } else {
            Write-ColorText "✗ Unit tests failed!" -Color $Red
            return $false
        }
    }
    catch {
        Write-ColorText "✗ Error running tests: $($_.Exception.Message)" -Color $Red
        return $false
    }
    return $true
}

function Run-Build {
    Write-Section "Building Application"
    Write-ColorText "Building Next.js application..." -Color $Blue
    
    try {
        pnpm build
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✓ Build successful!" -Color $Green
        } else {
            Write-ColorText "✗ Build failed!" -Color $Red
            return $false
        }
    }
    catch {
        Write-ColorText "✗ Error during build: $($_.Exception.Message)" -Color $Red
        return $false
    }
    return $true
}

function Run-Lint {
    Write-Section "Running Linter"
    Write-ColorText "Running ESLint..." -Color $Blue
    
    try {
        pnpm lint
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✓ Linting passed!" -Color $Green
        } else {
            Write-ColorText "✗ Linting failed!" -Color $Red
            return $false
        }
    }
    catch {
        Write-ColorText "✗ Error running linter: $($_.Exception.Message)" -Color $Red
        return $false
    }
    return $true
}

function Run-TypeCheck {
    Write-Section "Type Checking"
    Write-ColorText "Running TypeScript type check..." -Color $Blue
    
    try {
        pnpm check-types
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✓ Type check passed!" -Color $Green
        } else {
            Write-ColorText "✗ Type check failed!" -Color $Red
            return $false
        }
    }
    catch {
        Write-ColorText "✗ Error during type check: $($_.Exception.Message)" -Color $Red
        return $false
    }
    return $true
}

function Run-Dev {
    Write-Section "Starting Development Server"
    Write-ColorText "Starting Next.js development server..." -Color $Blue
    Write-ColorText "Press Ctrl+C to stop the server" -Color $Yellow
    
    try {
        pnpm dev
    }
    catch {
        Write-ColorText "✗ Error starting dev server: $($_.Exception.Message)" -Color $Red
    }
}

function Run-Clean {
    Write-Section "Cleaning Build Artifacts"
    Write-ColorText "Removing build artifacts..." -Color $Blue
    
    $foldersToClean = @(".next", ".turbo", "node_modules/.cache", "dist")
    
    foreach ($folder in $foldersToClean) {
        if (Test-Path $folder) {
            try {
                Remove-Item -Path $folder -Recurse -Force
                Write-ColorText "✓ Removed $folder" -Color $Green
            }
            catch {
                Write-ColorText "✗ Failed to remove $folder" -Color $Red
            }
        } else {
            Write-ColorText "- $folder doesn't exist" -Color $Yellow
        }
    }
    
    Write-ColorText "✓ Clean completed!" -Color $Green
}

function Run-Install {
    Write-Section "Installing Dependencies"
    Write-ColorText "Installing npm dependencies..." -Color $Blue
    
    try {
        pnpm install
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✓ Dependencies installed!" -Color $Green
        } else {
            Write-ColorText "✗ Installation failed!" -Color $Red
            return $false
        }
    }
    catch {
        Write-ColorText "✗ Error installing dependencies: $($_.Exception.Message)" -Color $Red
        return $false
    }
    return $true
}

function Run-All {
    Write-Section "Running Full Development Workflow"
    
    $steps = @(
        @{ Name = "Install Dependencies"; Function = { Run-Install } },
        @{ Name = "Type Check"; Function = { Run-TypeCheck } },
        @{ Name = "Lint"; Function = { Run-Lint } },
        @{ Name = "Unit Tests"; Function = { Run-Tests } },
        @{ Name = "Build"; Function = { Run-Build } }
    )
    
    $failedSteps = @()
    
    foreach ($step in $steps) {
        $result = & $step.Function
        if (-not $result) {
            $failedSteps += $step.Name
        }
    }
    
    Write-Section "Summary"
    if ($failedSteps.Count -eq 0) {
        Write-ColorText "🎉 All steps completed successfully!" -Color $Green
    } else {
        Write-ColorText "❌ The following steps failed:" -Color $Red
        foreach ($failed in $failedSteps) {
            Write-ColorText "  - $failed" -Color $Red
        }
    }
}

function Show-Help {
    Write-ColorText @"

🚀 Webapp Development Script

Usage: .\scripts\dev.ps1 [command]

Available Commands:
  test        Run unit tests with Vitest
  build       Build the Next.js application
  dev         Start development server
  lint        Run ESLint
  typecheck   Run TypeScript type checking
  clean       Clean build artifacts and cache
  install     Install npm dependencies
  all         Run full workflow (install, typecheck, lint, test, build)
  help        Show this help message

Examples:
  .\scripts\dev.ps1 test
  .\scripts\dev.ps1 build
  .\scripts\dev.ps1 all

"@ -Color $Cyan
}

# Main script logic
Write-Section "Webapp Development Script"

# Check if pnpm is installed
if (-not (Test-Command "pnpm")) {
    Write-ColorText "✗ pnpm is not installed or not in PATH" -Color $Red
    Write-ColorText "Please install pnpm first: npm install -g pnpm" -Color $Yellow
    exit 1
}

# Execute the requested command
switch ($Command.ToLower()) {
    "test" { Run-Tests }
    "build" { Run-Build }
    "dev" { Run-Dev }
    "lint" { Run-Lint }
    "typecheck" { Run-TypeCheck }
    "clean" { Run-Clean }
    "install" { Run-Install }
    "all" { Run-All }
    "help" { Show-Help }
    default { 
        Write-ColorText "Unknown command: $Command" -Color $Red
        Show-Help
    }
}

Write-Host ""