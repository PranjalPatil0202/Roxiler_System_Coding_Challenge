# Use official Node LTS Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install curl for healthcheck / network debugging
RUN apk add --no-cache curl

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose backend API port
EXPOSE 5000

# On container start: run conditional seed (only seeds if DB is empty), then launch server
CMD ["sh", "-c", "node src/seeds/autoSeed.js && node server.js"]
