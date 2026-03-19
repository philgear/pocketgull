FROM node:24-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Bundle app source
COPY . .

# Install secondary docs-portal dependencies (bypassed by root install)
RUN npm install --prefix docs --legacy-peer-deps

# Build the Angular application
RUN npm run build

# Expose port and run
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/server/server.mjs"]
