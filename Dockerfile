FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

ENV APP_API_URL=/api \
    BACKEND_UPSTREAM=http://backend:5001

COPY docker/nginx/default.conf.template /opt/fund-me/default.conf.template
COPY docker/nginx/runtime-config.js.template /opt/fund-me/runtime-config.js.template
COPY docker/nginx/40-fundme-config.sh /docker-entrypoint.d/40-fundme-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/health >/dev/null 2>&1 || exit 1
