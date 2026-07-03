# ==========================================
# Stage 1: Build
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Patch OS-level vulnerabilities
RUN apk update && apk upgrade --no-cache

# Update npm to resolve bundled package vulnerabilities (picomatch, tar, etc.)
RUN npm install -g npm@latest

# Install ALL dependencies (including devDependencies needed for ng build)
COPY package*.json ./
COPY docs/study/package.json ./docs/study/
COPY companion-apps/avs-therapy/package.json ./companion-apps/avs-therapy/
COPY pocketgull_api/package.json ./pocketgull_api/
RUN npm ci --legacy-peer-deps

# Copy source and build the docs/study Astro sub-project + Angular SSR app
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:24-alpine

WORKDIR /app

# Patch OS-level vulnerabilities in production image
RUN apk update && apk upgrade --no-cache

# Update npm to resolve bundled package vulnerabilities
RUN npm install -g npm@latest

# Set Node to production mode
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
COPY docs/study/package.json ./docs/study/
COPY companion-apps/avs-therapy/package.json ./companion-apps/avs-therapy/
COPY pocketgull_api/package.json ./pocketgull_api/
RUN npm ci --legacy-peer-deps --omit=dev --ignore-scripts

# Copy compiled output from builder (includes browser, server, docs/study, data/)
COPY --from=builder /app/dist ./dist

# Copy runtime assets the server loads from the project root at startup
COPY --from=builder /app/docs/openapi.json ./docs/openapi.json

# Run as non-root user for security
USER node

# Expose the default Cloud Run port
EXPOSE 8080
ENV PORT=8080
ENV OTEL_SDK_DISABLED=true

CMD ["node", "dist/server/server.mjs"]
