#!/bin/bash
# Quick setup script for FIVT development environment

set -e

echo "🚀 FIVT Development Environment Setup"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL
echo "📦 Starting PostgreSQL database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if .env.local exists
if [ ! -f "apps/webapp/.env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp apps/webapp/.env.example apps/webapp/.env.local
    echo "⚠️  Please edit apps/webapp/.env.local with your credentials"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install

# Run migrations
echo "🗄️  Running database migrations..."
cd apps/webapp
pnpm prisma migrate dev --name init || true
cd ../..

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit apps/webapp/.env.local with your API keys"
echo "2. Generate AUTH_SECRET: openssl rand -base64 32"
echo "3. Start development: cd apps/webapp && pnpm dev"
echo ""
echo "Database is running at: postgresql://fivt:fivt_dev_password@localhost:5432/fivt_dev"
echo "Stop database: docker-compose down"
echo ""
