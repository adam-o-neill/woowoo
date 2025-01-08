FROM node:18-alpine

WORKDIR /app

# Install build dependencies and Python
RUN apk add --no-cache \
    curl \
    unzip \
    python3 \
    make \
    g++ \
    gcc \
    linux-headers

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY scripts ./scripts

# Install dependencies with Python path specified
RUN npm install --production --python=/usr/bin/python3
RUN npm install -g typescript ts-node

# Download ephemeris files using ts-node/esm loader
RUN node --loader ts-node/esm scripts/download-ephemeris.js

# Copy the rest of the application
COPY . .

EXPOSE 8080

# Use ts-node with ESM loader
CMD ["node", "--loader", "ts-node/esm", "src/server.ts"]