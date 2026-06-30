FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app

COPY backend backend
COPY packages/shared packages/shared
RUN npm run build --workspace @invite/shared \
  && npm run build --workspace backend

FROM node:20-alpine AS production-deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=production-deps /app/backend/package.json ./backend/package.json
COPY --from=production-deps /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/packages/shared/dist ./packages/shared/dist

EXPOSE 3001

CMD ["node", "backend/dist/main.js"]
