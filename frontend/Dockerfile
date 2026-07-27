FROM node:24-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV HUSKY=0

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

FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/public ./frontend/public
COPY --from=build /app/frontend/.next/static ./frontend/.next/static

# next's standalone output tracing doesn't reliably pick up sharp's native
# binary in an npm workspaces monorepo; copy it straight from the verified
# `npm ci` install so image optimization can't silently fall back to a
# missing/wrong-platform binary.
COPY --from=deps /app/node_modules/sharp ./node_modules/sharp
COPY --from=deps /app/node_modules/@img ./node_modules/@img

EXPOSE 3000

CMD ["node", "frontend/server.js"]
