# Stage 1: Construcción y Compilación
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Imagen final ligera para Producción
FROM node:22-alpine AS production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Copiamos solo el código compilado desde la etapa anterior
COPY --from=builder /usr/src/app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main"]