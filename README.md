# Fund-Me Frontend

Material UI 3-style React workspace for the Fund-Me contribution management system.

## Run

```bash
npm install
npm run dev
```

Set `VITE_API_URL` if the backend is not on `http://127.0.0.1:5001/api`.

## Docker

Build the production image:

```bash
docker build -t fund-me-frontend .
```

For local production-style orchestration, prefer the shared compose file in the parent folder:

```bash
cd ..
docker compose up --build
```

If you run the frontend container by itself, point it at a reachable upstream:

```bash
docker run -p 8080:80 \
  -e APP_API_URL=/api \
  -e BACKEND_UPSTREAM=http://host.docker.internal:5001 \
  fund-me-frontend
```

The container:

- serves the built SPA through Nginx
- rewrites unknown routes back to `index.html`
- proxies `/api/*` to `BACKEND_UPSTREAM`
- supports runtime API URL injection through `runtime-config.js`, so you do not need to rebuild the frontend just to change the API host
