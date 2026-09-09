# Base image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application
# We pass the environment variables if any are needed at build time
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Copy built output and necessary files from builder
# Vite typically outputs to dist
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/vite.config.ts ./vite.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose the Cloud Run port
EXPOSE 8080

# Start the app using Vite's preview command
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port $PORT"]
