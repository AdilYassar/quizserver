# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build the app if you have a build step
# RUN npm run build


# Stage 2: Production stage
FROM node:22-alpine AS production

RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy everything from builder (now including videos)
COPY --from=builder --chown=nextjs:nodejs /app . 

USER nextjs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-4000}/is-alive', (res)=>{process.exit(res.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "start"]
