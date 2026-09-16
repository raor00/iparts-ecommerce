FROM node:24-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV BETTER_AUTH_SECRET=build-placeholder-secret-min-32-chars
ENV BETTER_AUTH_DB=/tmp/auth-build.sqlite
RUN pnpm build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3100
ENV HOSTNAME=0.0.0.0
ENV SHOP_DATA_PATH=/app/data/store.json
ENV BETTER_AUTH_DB=/app/data/auth.sqlite
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs \
  && mkdir -p /app/data
# pnpm workspace root nests the standalone output under .next/standalone/<package-name>
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/iparts-ecommerce ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN chown -R nextjs:nodejs /app/data
USER nextjs
EXPOSE 3100
VOLUME ["/app/data"]
CMD ["node", "server.js"]
