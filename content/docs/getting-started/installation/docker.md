---
title: Docker Deployment
description: Containerized deployment using Docker and Docker Compose.
order: 2
---

# Docker Deployment

Run the Wildfire Docs Platform in an isolated Docker container.

## Multi-stage Dockerfile

Create a `Dockerfile` in the root of your project:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content

EXPOSE 3000
CMD ["npm", "start"]
```

## Running with Docker Compose

```yaml
version: '3.8'
services:
  docs:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```
