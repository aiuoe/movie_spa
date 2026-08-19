# syntax=docker/dockerfile:1.7
# ──────────────────────────────────────────────────────────────────────────────
# movie_spa — Vue 3 SPA servida por nginx
#
# La imagen hace checkout del commit adentro (no COPY desde el build context).
# Args:
#   REPO   = aiuoe/movie_spa
#   COMMIT = branch / tag / sha  (default: main)
#
# Build:
#   docker build -t aiuoe/movie_spa:sha-a596ba6 \
#     --build-arg COMMIT=a596ba6 \
#     https://github.com/aiuoe/movie_spa.git#main
# ──────────────────────────────────────────────────────────────────────────────

ARG REPO=aiuoe/movie_spa
ARG COMMIT=main

# ──────────────────────────────────────────────────────────────────────────────
# Stage 0: clonar el commit exacto desde GitHub
# ──────────────────────────────────────────────────────────────────────────────
FROM alpine/git:latest AS src
ARG REPO
ARG COMMIT
RUN apk add --no-cache bash && \
    git clone --filter=blob:none --no-checkout https://github.com/${REPO}.git /src && \
    cd /src && \
    if echo "${COMMIT}" | grep -qE '^[0-9a-f]{7,}$'; then \
      git fetch --depth 1 origin ${COMMIT} && git checkout ${COMMIT}; \
    else \
      git checkout ${COMMIT}; \
    fi && \
    git log -1 --format="%H %s" > /COMMIT_INFO

# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: build con Bun + Vite
# ──────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS build

WORKDIR /app

COPY --from=src /src/package.json /src/bun.lock* ./
RUN bun install --frozen-lockfile --production=false

COPY --from=src /src/index.html /src/vite.config.js /src/tailwind.config.js /src/postcss.config.js ./
COPY --from=src /src/src ./src
COPY --from=src /src/public ./public

RUN bun run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: nginx sirviendo estáticos + proxy /api → movie_api:8080
# ──────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY --from=src /src/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

ARG COMMIT
ARG REPO
LABEL org.opencontainers.image.title="movie_spa" \
      org.opencontainers.image.source="https://github.com/${REPO}" \
      org.opencontainers.image.revision="${COMMIT}" \
      org.opencontainers.image.licenses="MIT"

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]