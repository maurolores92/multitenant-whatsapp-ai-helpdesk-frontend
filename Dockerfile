# ============================================================
# HelpDesk IA - Frontend (Next.js 14 + Vuexy)
# ============================================================

FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ARG NEXT_PUBLIC_WS_URL=http://localhost:5000
ARG NEXT_PUBLIC_JWT_EXPIRATION=7d

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_JWT_EXPIRATION=$NEXT_PUBLIC_JWT_EXPIRATION
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ------------------------------------------------------------
# Etapa de ejecución
# ------------------------------------------------------------
FROM node:22-slim AS runner

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["pnpm", "start"]
