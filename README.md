# Odoo Winter 2025 - Expense Management System

[![Next.js](https://img.shields.io/badge/Next.js-000000?&logo=nextdotjs&logoColor=white)](https://nextjs.org/) [![NestJS](https://img.shields.io/badge/NestJS-E0234E?&logo=nestjs&logoColor=white)](https://nestjs.com/) [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![Docker](https://img.shields.io/badge/Docker-2496ED?&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?&logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![Prisma](https://img.shields.io/badge/Prisma-2D3748?&logo=prisma&logoColor=white)](https://www.prisma.io/)

## Odoo Hackathon - October 4th, 2025 (Virtual Round)

**Team Name:** WinPaglu
**Problem Statement:** Expense Management
**Reviewer:** Aman Patel

## Deployment

Demo Video: [odoow25video.aryanranderiya.com](https://odoow25.aryanranderiya.com)

## Contributors

<a href="https://github.com/aryanranderiya/odoow25/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=aryanranderiya/odoow25" />
</a>

## Quick Start

### Start Services

```bash
docker compose up
```

### Run Frontend

```bash
cd frontend && pnpm install && pnpm dev
```

### Run Backend

```bash
cd backend && pnpm install && pnpm start:dev
```

## Database Setup

### Migration

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### Database Seeding

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
