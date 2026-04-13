# EduLinux — Next.js + server.js (WebSocket PTY)
# Les NEXT_PUBLIC_* doivent être passées au build (voir docker-compose / deploy doc).

FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# postinstall exécute scripts/chmod-node-pty-helpers.mjs — doit exister avant npm ci
COPY scripts/chmod-node-pty-helpers.mjs scripts/chmod-node-pty-helpers.mjs
RUN npm ci

COPY . .

# Next.js intègre ces valeurs au build — obligatoire pour le client Supabase
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# prune retire les devDependencies ; il peut supprimer build/Release de node-pty.
# Sur Linux il n’y a pas de prebuild npm — le .node est compilé par node-gyp → il faut le régénérer après prune.
RUN npm run build && npm prune --omit=dev && npm rebuild node-pty

# ─── Runtime ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# bash = shell des exercices PTY
RUN apt-get update && apt-get install -y --no-install-recommends bash ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 nodejs && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/data ./data
COPY --from=builder --chown=nodejs:nodejs /app/lib ./lib
COPY --from=builder --chown=nodejs:nodejs /app/server.js ./server.js
COPY --from=builder --chown=nodejs:nodejs /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# binaire auxiliaire (chemin selon build Release ou prebuild)
RUN sh -c 'for f in node_modules/node-pty/build/Release/spawn-helper node_modules/node-pty/prebuilds/linux-x64/spawn-helper; do [ -f "$f" ] && chmod +x "$f"; done' || true

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/ >/dev/null || exit 1

CMD ["node", "server.js"]
