FROM node:20-alpine AS build
WORKDIR /app

# Copy root workspace manifests + backend package.json
COPY package*.json ./
COPY backend/package.json ./backend/

# Install only backend workspace deps
RUN npm ci --workspace=backend --ignore-scripts

# Build
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src
WORKDIR /app/backend
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/src/infrastructure/database/migrations ./dist/infrastructure/database/migrations
EXPOSE 3000
CMD ["node", "dist/server.js"]
