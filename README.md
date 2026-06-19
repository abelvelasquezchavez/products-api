# Products API

A production-grade REST API for product management with JWT authentication, built with TypeScript, Express and Prisma. The project follows a clean, layered architecture and is intended as a portfolio piece demonstrating professional backend practices.

## Live demo

The API is deployed on Render with a managed TiDB Cloud (MySQL-compatible) database:

**Base URL:** https://products-api-w5hq.onrender.com/api

Quick check: [`/api/health`](https://products-api-w5hq.onrender.com/api/health)

> Hosted on a free instance — the first request after idle may take ~30–50s to wake the service.

## Features

- 🔐 **JWT authentication** — register and login with hashed passwords (bcrypt) and stateless Bearer tokens.
- 🛡️ **Public reads, protected writes** — anyone can browse products; creating, updating and deleting requires a valid token.
- 📦 **Full product CRUD** with **pagination** (`page`, `limit`) and consistent response envelopes.
- ✅ **Schema validation** of body, params and query with Zod.
- 🧱 **Layered architecture** — clear separation between routes, controllers, services and repositories.
- 🚨 **Centralized error handling** — custom error classes, a single error handler and an `asyncHandler` wrapper (no repeated try/catch).
- ⚙️ **Fail-fast configuration** — environment variables are validated at startup.
- 🛑 **Graceful shutdown** — handles `SIGTERM`/`SIGINT` and closes the Prisma connection cleanly.
- 🧪 **Integration tests** with Vitest and Supertest (Prisma mocked).
- 🐳 **Dockerized MySQL** via Docker Compose for local development.
- 📐 **Strict TypeScript** — no `any`, strict compiler options.

## Tech stack

| Concern          | Technology                          |
| ---------------- | ----------------------------------- |
| Language         | TypeScript (strict)                 |
| Runtime          | Node.js (>= 18)                     |
| Web framework    | Express 4                           |
| ORM              | Prisma                              |
| Database         | MySQL 8                             |
| Validation       | Zod                                 |
| Authentication   | jsonwebtoken (JWT)                  |
| Password hashing | bcrypt                              |
| Testing          | Vitest + Supertest                  |
| Tooling          | ts-node-dev, Docker Compose         |

## Architecture

The codebase is organized in layers so each concern has a single home. A request
flows from the route down through the controller, service and repository:

```
HTTP request
     │
     ▼
┌─────────────┐   routes/         Route definitions + middleware wiring
│   Routes    │
└─────────────┘
     │  validate (Zod) · requireAuth (JWT)
     ▼
┌─────────────┐   controllers/    HTTP layer — request/response only
│ Controllers │
└─────────────┘
     │
     ▼
┌─────────────┐   services/       Business logic, orchestration, DTO mapping
│  Services   │
└─────────────┘
     │
     ▼
┌─────────────┐   repositories/   Data access via Prisma
│Repositories │
└─────────────┘
     │
     ▼
   MySQL (Prisma)

Cross-cutting: config/ (env + Prisma client) · middlewares/ (auth, validate,
errorHandler) · schemas/ (Zod) · utils/ (AppError, asyncHandler, jwt, bcrypt)
```

```
src/
├── config/         Env validation (env.ts) + Prisma singleton (prisma.ts)
├── controllers/    HTTP layer (auth, product)
├── services/       Business logic (auth, product)
├── repositories/   Prisma data access (user, product)
├── middlewares/    auth.ts (JWT), validate.ts (Zod), errorHandler.ts
├── schemas/        Zod schemas (authSchema.ts, productSchema.ts)
├── routes/         Route definitions
├── utils/          AppError, asyncHandler, jwt, bcrypt
├── types/          Express type augmentation
├── app.ts          Express app factory
└── index.ts        Server bootstrap + graceful shutdown
prisma/schema.prisma
tests/
```

## Getting started

### Prerequisites

- Node.js >= 18
- Docker + Docker Compose (for the local MySQL instance)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example file and adjust values as needed:

```bash
cp .env.example .env
```

| Variable               | Description                                  | Default (example)                |
| ---------------------- | -------------------------------------------- | -------------------------------- |
| `PORT`                 | Port the HTTP server listens on              | `3000`                           |
| `NODE_ENV`             | `development` \| `test` \| `production`      | `development`                    |
| `DATABASE_URL`         | MySQL connection string (**required**)       | `mysql://products:products@localhost:3306/products` |
| `JWT_SECRET`           | Secret used to sign JWTs (**required**)      | —                                |
| `JWT_EXPIRES_IN`       | Token lifetime                               | `1d`                             |

The application validates these at startup and exits immediately if `DATABASE_URL`
or `JWT_SECRET` is missing or invalid.

### 3. Start MySQL

```bash
docker compose up -d
```

### 4. Run database migrations

```bash
npm run prisma:migrate
```

### 5. Start the server

```bash
npm run dev
```

The API is now available at `http://localhost:3000/api`.

### npm scripts

| Script                  | Description                                  |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | Start in watch mode (ts-node-dev)            |
| `npm run build`         | `prisma generate` + TypeScript compile       |
| `npm start`             | Run the compiled server (`dist/`)            |
| `npm test`              | Run the test suite once (Vitest)             |
| `npm run test:watch`    | Run tests in watch mode                      |
| `npm run prisma:migrate`| Apply Prisma migrations (dev)                |
| `npm run prisma:studio` | Open Prisma Studio                           |

## API reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint         | Auth | Description                          |
| ------ | ---------------- | ---- | ------------------------------------ |
| GET    | `/health`        | No   | Health check                         |
| POST   | `/auth/register` | No   | Register a user, returns a JWT       |
| POST   | `/auth/login`    | No   | Authenticate, returns a JWT          |
| GET    | `/products`      | No   | List products (paginated)            |
| GET    | `/products/:id`  | No   | Get a single product (404 if absent) |
| POST   | `/products`      | Yes  | Create a product                     |
| PUT    | `/products/:id`  | Yes  | Update a product                     |
| DELETE | `/products/:id`  | Yes  | Delete a product                     |

Protected endpoints expect an `Authorization: Bearer <token>` header.

### Response shapes

List endpoint:

```json
{
  "data": [ { "id": 1, "name": "Keyboard", "description": null, "price": 49.99, "stock": 10, "createdAt": "...", "updatedAt": "..." } ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

Single resource: `{ "data": { ... } }`. Errors: `{ "status": "error", "message": "...", "errors": [ ... ] }`.

## Example requests

Register (returns a token):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "jane@example.com", "password": "supersecret" }'
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "jane@example.com", "password": "supersecret" }'
```

List products (paginated, public):

```bash
curl "http://localhost:3000/api/products?page=1&limit=10"
```

Get one product:

```bash
curl http://localhost:3000/api/products/1
```

Create a product (protected — replace `$TOKEN`):

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "name": "Keyboard", "description": "Mechanical keyboard", "price": 49.99, "stock": 10 }'
```

Update a product:

```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "price": 39.99, "stock": 5 }'
```

Delete a product:

```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Testing

Integration tests use Supertest to drive the Express app while Prisma is mocked,
so the suite runs without a live database. Covered scenarios include the health
check, paginated listing, fetching a product by id (found and 404), auth flows
and rejecting unauthenticated writes (401).

```bash
npm test
```

## License

MIT
