FROM node:18-alpine

WORKDIR /app

# Install curl and unzip
RUN apk add --no-cache curl unzip

# Copy package files and install dependencies
COPY package*.json ./
COPY scripts ./scripts
RUN npm install --production

# Download ephemeris files
RUN node scripts/download-ephemeris.js

# Copy the rest of the application
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]