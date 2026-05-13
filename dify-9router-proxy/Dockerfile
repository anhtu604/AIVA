FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server.js .
COPY models.json .

EXPOSE 20129

CMD ["node", "server.js"]
