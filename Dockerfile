# Use a Node.js base image
FROM oven/bun:latest

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json bun.lock ./
COPY tsconfig.json ./
COPY config.example.json ./config.json

# Install dependencies
RUN bun install

# Copy source files
COPY src ./src

# Run the bot
CMD ["bun", "run", "src/index.ts"]