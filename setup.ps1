# Quick setup script for FIVT development environment

Write-Host "🚀 FIVT Development Environment Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL
Write-Host "📦 Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if .env.local exists
if (!(Test-Path "apps\webapp\.env.local")) {
    Write-Host "📝 Creating .env.local from template..." -ForegroundColor Yellow
    Copy-Item "apps\webapp\.env.example" "apps\webapp\.env.local"
    Write-Host "⚠️  Please edit apps\webapp\.env.local with your credentials" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
Set-Location "apps\webapp"
pnpm prisma migrate dev --name init
Set-Location "..\..\"

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit apps\webapp\.env.local with your API keys"
Write-Host "2. Generate AUTH_SECRET with: openssl rand -base64 32"
Write-Host "3. Start development: cd apps\webapp; pnpm dev"
Write-Host ""
Write-Host "Database is running at: postgresql://fivt:fivt_dev_password@localhost:5432/fivt_dev" -ForegroundColor Yellow
Write-Host "Stop database: docker-compose down" -ForegroundColor Yellow
Write-Host ""
