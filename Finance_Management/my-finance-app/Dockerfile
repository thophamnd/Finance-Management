# Stage 1: Build React/Vite app bằng Node 20
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Vite sẽ build code ra thư mục /app/dist
RUN npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:alpine
# Copy file đã build sang thư mục web của Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Mở port 80
EXPOSE 80
# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]