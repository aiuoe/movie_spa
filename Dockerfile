# syntax=docker/dockerfile:1.7
# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: build con Bun + Vite
# ──────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS build

WORKDIR /app

# Cache de deps — copia solo manifests primero
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production=false

COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY src ./src
COPY public ./public

RUN bun run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: nginx sirviendo los estáticos + proxy /api → movie_api:8080
# ──────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Configuración con proxy a movie_api
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Estáticos del build
COPY --from=build /app/dist /usr/share/nginx/html

# Etiqueta y HEALTHCHECK
LABEL org.opencontainers.image.title="movie_spa" \
      org.opencontainers.image.source="https://example.local/movie_spa"

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]