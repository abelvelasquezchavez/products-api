# Deployment & Workflow Guide

This document describes how the project is versioned, tested and deployed. It
covers the branching model, the CI/CD pipeline, the release process and the
steps to run the API in the cloud.

## Branching model — GitHub Flow

The repository follows **GitHub Flow**, a lightweight, deploy-friendly model:

- `main` is always **production-ready and deployable**.
- All work happens on short-lived branches created from `main`:
  - `feat/<name>` — new features
  - `fix/<name>` — bug fixes
  - `chore/<name>`, `docs/<name>`, `ci/<name>` — supporting changes
- Open a **Pull Request** into `main`. The CI pipeline must pass before merge.
- After review, **merge to `main`** → this triggers an automatic deploy.

```
feat/add-categories ─┐
fix/price-rounding ──┤  PR + CI ✓  ──▶  main  ──▶  auto-deploy to prod
docs/update-readme ──┘                   │
                                         └──▶  tag vX.Y.Z ──▶ GitHub Release
```

> Recommended: enable **branch protection** on `main` in GitHub
> (Settings → Branches): require a passing CI check and at least one PR review.

## CI/CD pipeline (GitHub Actions)

Two workflows live in `.github/workflows/`:

| Workflow      | Trigger                          | What it does                                  |
| ------------- | -------------------------------- | --------------------------------------------- |
| `ci.yml`      | push to `main`, PRs to `main`    | Install deps, generate Prisma client, type-check (`tsc --noEmit`), run tests |
| `release.yml` | push of a tag matching `v*.*.*`  | Create a GitHub Release with auto-generated notes |

The **CD** part (the actual deploy) is handled by the hosting platform's GitHub
integration, which redeploys whenever `main` changes — so CI guards quality and
the platform performs the deploy.

## Versioning & releases (SemVer)

Versions follow **Semantic Versioning** — `vMAJOR.MINOR.PATCH`:

- **MAJOR** — incompatible/breaking changes
- **MINOR** — backwards-compatible new features
- **PATCH** — backwards-compatible bug fixes

To cut a release once `main` holds the code you want in production:

```bash
# 1. Tag the release (annotated)
git tag -a v1.0.0 -m "First production release: auth + product CRUD"

# 2. Push the tag — this triggers release.yml
git push origin v1.0.0
```

The `release.yml` workflow then publishes a GitHub Release with notes generated
from the commits/PRs since the previous tag. You can also create it manually:

```bash
gh release create v1.0.0 --title "v1.0.0" --generate-notes
```

Keep `CHANGELOG.md` updated alongside each release.

## Running with Docker

A multi-stage `Dockerfile` produces a slim production image.

```bash
# Build the image
docker build -t products-api .

# Run it (provide the runtime environment variables)
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@host:3306/db" \
  -e JWT_SECRET="a-long-random-secret" \
  products-api
```

## Cloud deployment (free-tier friendly)

A simple, low-cost setup suitable for a portfolio:

- **App hosting:** a PaaS that deploys from GitHub on push (e.g. Render free web
  service). Connect the repo and select `main`; every push redeploys.
- **Database:** a managed MySQL on a free tier (e.g. Aiven or TiDB Cloud
  Serverless). Copy its connection string into `DATABASE_URL`.

### Required environment variables in production

| Variable         | Notes                                      |
| ---------------- | ------------------------------------------ |
| `DATABASE_URL`   | Managed MySQL connection string            |
| `JWT_SECRET`     | Long random secret                         |
| `JWT_EXPIRES_IN` | Optional, defaults to `1d`                 |
| `PORT`           | Often injected by the platform             |
| `NODE_ENV`       | Set to `production`                        |

### Database migrations in production

Local development uses `prisma migrate dev` (which creates migrations). In
production, **apply** the already-committed migrations with:

```bash
npx prisma migrate deploy
```

Run this as the platform's release/pre-deploy command (where dev dependencies,
including the Prisma CLI, are available) so the schema is up to date before the
new version starts serving traffic.

## Deployment checklist

- [x] Repository pushed to GitHub with `main` as default branch
- [x] Branch protection enabled on `main`
- [x] Managed MySQL provisioned; `DATABASE_URL` obtained
- [x] App hosting connected to the repo (auto-deploy on `main`)
- [x] Production env vars configured (`DATABASE_URL`, `JWT_SECRET`)
- [x] `prisma migrate deploy` wired as the release command
- [x] First release tagged (`v1.0.0`) and GitHub Release published
