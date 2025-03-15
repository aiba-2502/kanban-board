FROM node:20-alpine AS base

RUN apk add --no-cache python3 make g++ libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files (only package.json)
COPY package.json ./

# Install dependencies and generate package-lock.json if it doesn't exist
RUN npm install
RUN npm install --save-dev @types/react @types/react-dom @types/cors @types/express @types/uuid

# Development image
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
EXPOSE 3001

# Create required directories
RUN mkdir -p src/types

# Start the application
CMD ["sh", "-c", "node server.js & npm run dev -- --host"]

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]