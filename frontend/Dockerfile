FROM node:20-alpine AS build
WORKDIR /app

# Copy root workspace manifests + frontend package.json
COPY package*.json ./
COPY frontend/package.json ./frontend/

# Install only frontend workspace deps
RUN npm ci --workspace=frontend --ignore-scripts

# Build
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
