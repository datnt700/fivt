# Docker Setup for Development

This directory contains Docker Compose configuration for local development.

## PostgreSQL Database

The Docker Compose file sets up a PostgreSQL 16 database for local development.

### Quick Start

1. **Start the database:**

   ```bash
   docker-compose up -d
   ```

2. **Copy the environment file:**

   ```bash
   cd apps/webapp
   cp .env.example .env.local
   ```

3. **Run migrations:**

   ```bash
   cd apps/webapp
   pnpm prisma migrate dev
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

### Database Connection

- **Host:** localhost
- **Port:** 5432
- **Database:** fivt_dev
- **Username:** fivt
- **Password:** fivt_dev_password
- **Connection String:** `postgresql://fivt:fivt_dev_password@localhost:5432/fivt_dev`

### Useful Commands

```bash
# Start the database
docker-compose up -d

# Stop the database
docker-compose down

# Stop and remove data (fresh start)
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker-compose exec postgres psql -U fivt -d fivt_dev

# Check database status
docker-compose ps
```

### Prisma Commands

```bash
# Run migrations
pnpm prisma migrate dev

# Reset database
pnpm prisma migrate reset

# Generate Prisma Client
pnpm prisma generate

# Open Prisma Studio
pnpm prisma studio
```

### Troubleshooting

**Port 5432 already in use:**

- Stop any local PostgreSQL service
- Or change the port in `docker-compose.yml` (e.g., `5433:5432`)

**Connection refused:**

- Check if the container is running: `docker-compose ps`
- Check logs: `docker-compose logs postgres`
- Wait for healthcheck to pass: `docker-compose ps` (should show "healthy")

**Need to change password:**

1. Edit `docker-compose.yml` environment variables
2. Remove old volume: `docker-compose down -v`
3. Start fresh: `docker-compose up -d`
4. Update `DATABASE_URL` in `.env.local`
