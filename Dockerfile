# ── Stage 1: Build the React frontend ──────────────────────
# We use a separate stage because the frontend needs dev dependencies
# (vite, react, etc.) ONLY to build. We don't ship them.
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# Copy package files FIRST (layer caching trick)
# If these files haven't changed, Docker skips the npm ci layer below
COPY frontend/package*.json ./
RUN npm ci

# NOW copy the rest of the source code
# Code changes are frequent, but they only invalidate THIS layer and below
COPY frontend/ ./

# Build: JSX/React → static HTML/CSS/JS files in /frontend/dist/
RUN npm run build


# ── Stage 2: Production server ─────────────────────────────
# Start fresh — Stage 1 is thrown away. Only the build output survives.
FROM node:20-alpine

WORKDIR /app

# Same caching trick for backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Grab ONLY the built static files from Stage 1
# Express will serve these from the /app/public/ folder
COPY --from=frontend-build /frontend/dist ./public/

# Document which port the app listens on
# (doesn't actually open it — that's what -p does at runtime)
EXPOSE 8080

# Tell Node.js this is production (enables Express optimizations)
ENV NODE_ENV=production

# The command that runs when the container starts
CMD ["node", "server.js"]
