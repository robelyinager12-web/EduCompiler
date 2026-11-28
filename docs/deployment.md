# Deployment reference

## Settings

| Place | Setting | Value |
|---|---|---|
| Render | Root directory | `server` |
| Render | Build command | `npm install --include=dev && npx prisma generate && npm run build` |
| Render | Start command | `npx prisma migrate deploy && npm start` |
| Render | Health check path | `/api/health` |
| Render | `NODE_ENV`, `NODE_VERSION` | `production`, `22` |
| Render | `DATABASE_URL` | Neon pooled string (host contains `-pooler`) |
| Render | `DIRECT_URL` | Neon direct string (no `-pooler`) |
| Render | `JWT_SECRET` | Random, at least 32 characters, different from development |
| Render | `CLIENT_URL` | The Vercel URL, no trailing slash |
| Vercel | Root directory | `client` |
| Vercel | Framework, build, output | Vite, `npm run build`, `dist` |
| Vercel | `VITE_API_URL` | `https://YOUR-API.onrender.com/api` (set before the build) |

## Rules

- Never commit `.env` files or put secrets in `VITE_` variables.
- Use `https` in `VITE_API_URL`, or the browser blocks the calls.
- `VITE_API_URL` is read at build time, so redeploy the client after changing it.
- Commit `server/prisma/migrations`. `migrate deploy` applies only committed migrations.

## Free-tier behavior

Render sleeps an idle free service, and the first request can take about a minute. Neon
suspends an idle database and wakes it on the next query. Open `/api/health` a minute before a
demonstration.

## Migrations

After changing the schema locally: `npx prisma migrate dev --name describe-change`, commit the
new folder in `prisma/migrations`, push, and Render applies it on the next start.
