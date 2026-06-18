# syntax=docker/dockerfile:1

# ---------- Stage 1: build ----------
# Installs all dependencies, generates the Prisma client and compiles TypeScript.
# A Debian-based image is used (instead of Alpine) so the native `bcrypt`
# binary installs from a prebuilt package — no compiler toolchain required.
FROM node:20-slim AS builder

WORKDIR /app

# The Prisma schema must be present before `npm ci` because the @prisma/client
# postinstall hook runs `prisma generate`.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Copy the rest of the source and build (prisma generate && tsc -> dist/).
COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
# Minimal image carrying only what the server needs at runtime.
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Reuse the modules already installed/compiled in the builder (the native
# bcrypt binary and the generated Prisma client), then drop dev dependencies.
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
RUN npm prune --omit=dev

# Run as the unprivileged user that ships with the node image.
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
