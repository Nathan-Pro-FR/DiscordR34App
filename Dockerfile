# syntax=docker/dockerfile:1
FROM node:22-alpine

WORKDIR /app

# Install production dependencies first for better layer caching.
COPY package*.json ./
RUN npm install --omit=dev

# Copy the application source.
COPY src ./src

ENV NODE_ENV=production

# Register slash commands on boot, then start the gateway client.
CMD ["sh", "-c", "node src/deploy-commands.js && node src/index.js"]
