FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://backend:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY frontend frontend
COPY packages/shared packages/shared
RUN npm run build --workspace @invite/shared \
  && npm run build --workspace frontend

FROM node:20-alpine AS runner
WORKDIR /app

ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/public ./frontend/public
COPY --from=build /app/frontend/.next/static ./frontend/.next/static

EXPOSE 3000

CMD ["node", "frontend/server.js"]
