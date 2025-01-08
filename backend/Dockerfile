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
RUN npm install -g ts-node typescript

# Download ephemeris files (using node with --experimental-modules flag)
RUN node --experimental-modules scripts/download-ephemeris.js

# Copy the rest of the application
COPY . .

EXPOSE 8080
CMD ["ts-node", "--esm", "src/server.ts"]