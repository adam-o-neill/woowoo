FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache \
    curl \
    unzip \
    python3 \
    make \
    g++ \
    gcc \
    linux-headers

COPY package*.json ./
COPY tsconfig.json ./
COPY scripts ./scripts

# Install ALL dependencies (including devDependencies)
RUN npm install

# Download ephemeris files
RUN npx ts-node scripts/download-ephemeris.ts

COPY . .

EXPOSE 8080

CMD ["npx", "ts-node", "src/server.ts"]