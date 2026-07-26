# Stage 1: Build
FROM node:24-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:24-slim
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/admin ./src/admin
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/admin ./src/admin
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV ADMIN_JS_SKIP_BUNDLE=true

# non-root (безопаснее)
USER node

EXPOSE 3000
CMD ["node", "dist/main"]