# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install -f
COPY . .
COPY .env ./
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install -f --only=production 
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
