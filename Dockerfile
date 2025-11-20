## Multi-stage Dockerfile for Next.js monolith with Prisma
FROM node:20-bookworm-slim AS base

# Add a non-root user for security
RUN useradd -m -u 1001 appuser

WORKDIR /app

# Install system deps often needed by Prisma / OpenSSL
RUN apt-get update && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app

# Copy lockfiles first for better caching
COPY package.json package-lock.json* ./

# Install dependencies (include dev deps for prisma/next build)
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .

# Generate Prisma Client and build Next.js
RUN npm run prisma:generate
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only the necessary output for running
COPY --from=build /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma

# Change ownership to appuser before switching
RUN chown -R appuser:appuser /app

# Run as non-root
USER appuser

EXPOSE 3000

# On startup, ensure DB schema is applied, then start server
CMD ["bash", "-lc", "npm run prisma:generate && npm run prisma:push && npm run start"]
