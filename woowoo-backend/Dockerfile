FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY ephemeris_files ./ephemeris_files
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["node", "server.js"] 