# ═══════════════════════════════════════════════════════════════════════════════
# Dockerfile for InterviewOS Backend (Node.js + Express)
# ═══════════════════════════════════════════════════════════════════════════════
#
# Multi-stage build reduces final image size:
#  - Build stage: Install all dependencies + build artifacts
#  - Runtime stage: Copy only production binaries
#
# Usage:
#  docker build -t interviewos-api:latest .
#  docker run -p 8090:8090 --env-file .env interviewos-api:latest

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm ci

# ─── Runtime Stage ────────────────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Set non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy only production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy application code
COPY src ./src
COPY .env* ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8090/health', () => process.exit(0))"

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8090

# Start application
CMD ["npm", "start"]
