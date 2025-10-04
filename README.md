# Odoo Winter 2025

## Run Frontend

```bash
cd frontend && pnpm install && pnpm dev
```

## Run Backend

```bash
cd backend && pnpm install && pnpm start:dev
```

## Database Setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

## Database Seeding

To populate the database with default data (company, admin user, and expense categories), run:

```bash
cd backend
pnpm db:seed
```

Or using Prisma directly:

```bash
cd backend
npx prisma db seed
```

## Start Services

```bash
docker compose up
```
