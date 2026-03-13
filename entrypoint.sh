#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Checking if database needs seeding..."
NEEDS_SEED=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.role.count()
  .then(count => { console.log(count === 0 ? 'yes' : 'no'); return p.\$disconnect(); })
  .catch(() => { console.log('yes'); return p.\$disconnect(); });
" 2>/dev/null)

if [ "$NEEDS_SEED" = "yes" ]; then
  echo "Database is empty, seeding..."
  npx ts-node prisma/seed.ts
  echo "Seed completed!"
else
  echo "Database already seeded, skipping."
fi

echo "Starting NestJS server..."
exec node dist/src/main
