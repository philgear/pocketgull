# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /usr/src/app

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
