# Stage 1: Build
FROM node:24-alpine@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd AS builder

WORKDIR /usr/src/app

# Update system packages to resolve vulnerabilities
RUN apk update && apk upgrade --no-cache

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:24-alpine@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd


WORKDIR /usr/src/app

# Update system packages to resolve vulnerabilities in production stage
RUN apk update && apk upgrade --no-cache

# Set Node to production environment
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled dist from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Run as non-root user for security
USER node

# Expose the default Cloud Run port
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]

