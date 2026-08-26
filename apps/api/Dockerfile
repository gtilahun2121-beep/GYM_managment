FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN npm ci --omit=dev

# Build
FROM base AS builder
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN npm ci
COPY . .
RUN npm run build

# Production
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
