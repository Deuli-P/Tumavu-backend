# Tumavu Backend

Backend Node.js avec **NestJS + TypeScript + PostgreSQL + Prisma**.

## Pourquoi Prisma ici

Oui, Prisma est recommandé pour ce setup:
- Typage fort côté base de données
- Migrations versionnées
- API simple à intégrer avec NestJS

## Prérequis

- Node.js 20+
- npm 10+
- Docker (optionnel mais recommandé pour PostgreSQL local)

## Installation

```bash
npm install
cp .env.example .env
```

## Lancer PostgreSQL local

```bash
docker compose up -d
```

## Initialiser Prisma

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

## Démarrer le backend

```bash
npm run start:dev
```

API health check:
- `GET http://localhost:3000/api/health`

## Structure

- `src/`: code NestJS
- `src/prisma/`: module/service Prisma pour injection Nest
- `prisma/schema.prisma`: schéma de données
- `docker-compose.yml`: PostgreSQL local
