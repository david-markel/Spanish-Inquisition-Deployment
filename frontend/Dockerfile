# Stage 1: Build
FROM node:14-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:14-alpine
WORKDIR /app
COPY --from=build /app/dist/frontend/ /app
RUN npm install -g serve
RUN ls /app
CMD ["serve", "-s", "/app", "-l", "80"]
