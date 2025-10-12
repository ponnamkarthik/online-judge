FROM node:22-alpine

WORKDIR /app

# Install execution runtimes for sandboxed code
RUN apk add --no-cache python3 g++ openjdk17-jdk || apk add --no-cache openjdk17

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 4000

# Default command is overridden in docker-compose for dev; keep dev here
CMD ["npm", "run", "dev"]