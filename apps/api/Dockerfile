FROM oven/bun:1.1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
COPY apps/api/package.json ./apps/api/
COPY packages/core/package.json ./packages/core/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/core ./packages/core

# Expose port
EXPOSE 3001

# Start the API
CMD ["bun", "run", "apps/api/src/index.ts"]
