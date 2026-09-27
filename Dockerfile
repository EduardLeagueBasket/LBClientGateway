# Stage 1: Build (Ambiente de construcción)
FROM node:22-alpine AS build

# Creamos el directorio de trabajo
WORKDIR /usr/src/app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos todas las dependencias (incluyendo las de desarrollo para compilar)
RUN npm install

# Copiamos el resto del código
COPY . .

EXPOSE 3000