# Stock Hub

Mini application de gestion de stock et de tracabilite materiel.

Stack retenue :
- React + TypeScript + Vite pour le web.
- Node.js + Fastify + TypeScript pour l'API.
- PostgreSQL + Prisma pour la base.
- pnpm en monorepo.

Structure :
- apps/web : interface utilisateur.
- apps/api : API HTTP.
- packages/domain : types et regles metier.
- packages/database : Prisma et acces base.
- docs : cadrage, roadmap, decisions et tests.

Premiers lancements prevus :
- pnpm install
- pnpm db:generate
- pnpm web:dev
- pnpm api:dev
