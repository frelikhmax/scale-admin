# Scale Admin

Base TASK-001 skeleton for the Scale Admin MVP.

## Run locally with Docker Compose

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend health: http://localhost:3000/api/health
- PostgreSQL: localhost:5432 (`scale_admin` / `scale_admin_password`)

## Backend seed

After migrations, seed the first local admin and sample manual-test data:

```bash
cd backend
npm run prisma:seed
```

Local development defaults are documented in `backend/.env.example`:

- `SEED_ADMIN_EMAIL=admin@example.com`
- `SEED_ADMIN_PASSWORD=admin12345`
- `SEED_ADMIN_FULL_NAME=Local Admin`

Override these values before seeding shared or non-local databases. Re-running the seed is idempotent; set `SEED_ADMIN_RESET_PASSWORD=true` only when intentionally rotating the existing seeded admin password.
