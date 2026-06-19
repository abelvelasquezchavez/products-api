# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-06-18

### Added
- Layered REST API (controllers, services, repositories) with TypeScript and Express.
- JWT authentication: `POST /api/auth/register` and `POST /api/auth/login`.
- Product CRUD with public reads and protected writes, plus paginated listing.
- Centralized error handling, Zod validation, env validation and graceful shutdown.
- Integration tests (Vitest + Supertest) with Prisma mocked.
- Docker Compose for local MySQL and a multi-stage production `Dockerfile`.
- Baseline Prisma migration (`prisma migrate deploy`-ready) for the `users` and `products` tables.
- CI workflow (type-check + tests) and release workflow (GitHub Releases on tags).
- Deployment & workflow guide.

[Unreleased]: https://github.com/abelvelasquezchavez/products-api/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/abelvelasquezchavez/products-api/releases/tag/v1.0.0
