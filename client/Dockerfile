# Stage 1: Build the React application bundle
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests and install packages
COPY package*.json ./
RUN npm ci

# Copy source code and compile production bundle
COPY . .
RUN npm run build

# Stage 2: Serve static files with lightweight Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
