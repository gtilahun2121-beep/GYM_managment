FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci --omit=dev

# Build
FROM base AS builder
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci
COPY . .
RUN npm run build

# Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
