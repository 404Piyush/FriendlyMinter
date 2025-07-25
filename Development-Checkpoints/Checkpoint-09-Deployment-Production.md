# Checkpoint 09: Deployment & Production Setup

## Overview
This checkpoint covers deployment strategies, production configurations, monitoring, and maintenance for the cNFT Mailchimp Platform.

## Core Dependencies

### Production Dependencies
```bash
# Process Management
npm install pm2 -g

# Monitoring & Logging
npm install winston winston-daily-rotate-file
npm install @sentry/nextjs
npm install newrelic

# Performance & Caching
npm install redis ioredis
npm install compression

# Security
npm install helmet
npm install express-rate-limit
npm install cors

# Health Checks
npm install @godaddy/terminus
```

## Environment Configuration

### Production Environment Variables (.env.production)
```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30000

# Redis
REDIS_URL=redis://user:password@host:6379
REDIS_CLUSTER_NODES=host1:6379,host2:6379,host3:6379

# Solana
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your-production-private-key
SOLANA_COMMITMENT=confirmed

# IPFS
PINATA_API_KEY=your-production-api-key
PINATA_SECRET_API_KEY=your-production-secret
PINATA_JWT=your-production-jwt

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key
NEW_RELIC_APP_NAME=cnft-platform

# Security
CSRF_SECRET=your-csrf-secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_MONITORING=true
ENABLE_RATE_LIMITING=true
```

## Docker Configuration

### Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generate client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cnft_platform
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

## Process Management

### PM2 Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [
    {
      name: 'cnft-platform-web',
      script: 'npm',
      args: 'start',
      cwd: '/app',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/cnft-web-error.log',
      out_file: '/var/log/pm2/cnft-web-out.log',
      log_file: '/var/log/pm2/cnft-web.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
    },
    {
      name: 'cnft-platform-workers',
      script: 'dist/workers/start-workers.js',
      cwd: '/app',
      instances: 2,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        WORKER_CONCURRENCY: 5,
      },
      error_file: '/var/log/pm2/cnft-workers-error.log',
      out_file: '/var/log/pm2/cnft-workers-out.log',
      log_file: '/var/log/pm2/cnft-workers.log',
      time: true,
      max_memory_restart: '512M',
      restart_delay: 5000,
    },
  ],
};
```

### Worker Process (workers/start-workers.ts)
```typescript
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';
import { mintWorker } from './mint-worker';
import { uploadWorker } from './upload-worker';
import { metadataWorker } from './metadata-worker';
import { cleanupWorker } from './cleanup-worker';

const redis = new Redis(process.env.REDIS_URL!);

const workers = [
  new Worker('mint-queue', mintWorker, {
    connection: redis,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3'),
    removeOnComplete: 100,
    removeOnFail: 50,
  }),
  new Worker('upload-queue', uploadWorker, {
    connection: redis,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
    removeOnComplete: 50,
    removeOnFail: 25,
  }),
  new Worker('metadata-queue', metadataWorker, {
    connection: redis,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '10'),
    removeOnComplete: 50,
    removeOnFail: 25,
  }),
  new Worker('cleanup-queue', cleanupWorker, {
    connection: redis,
    concurrency: 1,
    removeOnComplete: 10,
    removeOnFail: 10,
  }),
];

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down workers gracefully');
  
  await Promise.all(
    workers.map(worker => worker.close())
  );
  
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down workers gracefully');
  
  await Promise.all(
    workers.map(worker => worker.close())
  );
  
  await redis.quit();
  process.exit(0);
});

logger.info(`Started ${workers.length} workers`);
```

## Monitoring & Logging

### Logger Configuration (lib/logger.ts)
```typescript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'cnft-platform',
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File transport for production
    new DailyRotateFile({
      filename: '/var/log/cnft-platform/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),
    
    // Error file transport
    new DailyRotateFile({
      filename: '/var/log/cnft-platform/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
    }),
  ],
});

// Add Sentry transport for production
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
  
  logger.add(new winston.transports.Console({
    level: 'error',
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    handleExceptions: true,
    handleRejections: true,
  }));
}

export { logger };
```

### Health Check API (pages/api/health.ts)
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL!);

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    solana: 'healthy' | 'unhealthy';
    ipfs: 'healthy' | 'unhealthy';
  };
  metrics?: {
    memoryUsage: NodeJS.MemoryUsage;
    activeConnections: number;
    queueStats: any;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthStatus>
) {
  const startTime = Date.now();
  
  try {
    const checks = await Promise.allSettled([
      checkDatabase(),
      checkRedis(),
      checkSolana(),
      checkIPFS(),
    ]);
    
    const [database, redisCheck, solana, ipfs] = checks.map(
      (result) => result.status === 'fulfilled' ? result.value : 'unhealthy'
    );
    
    const allHealthy = [database, redisCheck, solana, ipfs].every(
      (check) => check === 'healthy'
    );
    
    const healthStatus: HealthStatus = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database,
        redis: redisCheck,
        solana,
        ipfs,
      },
    };
    
    // Add metrics in development/staging
    if (process.env.NODE_ENV !== 'production') {
      healthStatus.metrics = {
        memoryUsage: process.memoryUsage(),
        activeConnections: 0, // TODO: Implement connection counting
        queueStats: await getQueueStats(),
      };
    }
    
    const responseTime = Date.now() - startTime;
    
    logger.info('Health check completed', {
      status: healthStatus.status,
      responseTime,
      checks: healthStatus.checks,
    });
    
    res.status(allHealthy ? 200 : 503).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed', { error });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: 'unhealthy',
        redis: 'unhealthy',
        solana: 'unhealthy',
        ipfs: 'unhealthy',
      },
    });
  }
}

async function checkDatabase(): Promise<'healthy' | 'unhealthy'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'healthy';
  } catch (error) {
    logger.error('Database health check failed', { error });
    return 'unhealthy';
  }
}

async function checkRedis(): Promise<'healthy' | 'unhealthy'> {
  try {
    await redis.ping();
    return 'healthy';
  } catch (error) {
    logger.error('Redis health check failed', { error });
    return 'unhealthy';
  }
}

async function checkSolana(): Promise<'healthy' | 'unhealthy'> {
  try {
    const { Connection } = await import('@solana/web3.js');
    const connection = new Connection(process.env.SOLANA_RPC_URL!);
    await connection.getLatestBlockhash();
    return 'healthy';
  } catch (error) {
    logger.error('Solana health check failed', { error });
    return 'unhealthy';
  }
}

async function checkIPFS(): Promise<'healthy' | 'unhealthy'> {
  try {
    // Simple check to Pinata API
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
    });
    
    if (response.ok) {
      return 'healthy';
    }
    return 'unhealthy';
  } catch (error) {
    logger.error('IPFS health check failed', { error });
    return 'unhealthy';
  }
}

async function getQueueStats() {
  try {
    const { Queue } = await import('bullmq');
    const queues = ['mint-queue', 'upload-queue', 'metadata-queue', 'cleanup-queue'];
    
    const stats = await Promise.all(
      queues.map(async (queueName) => {
        const queue = new Queue(queueName, { connection: redis });
        const waiting = await queue.getWaiting();
        const active = await queue.getActive();
        const completed = await queue.getCompleted();
        const failed = await queue.getFailed();
        
        return {
          name: queueName,
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length,
        };
      })
    );
    
    return stats;
  } catch (error) {
    logger.error('Failed to get queue stats', { error });
    return [];
  }
}
```

## Security Configuration

### Security Middleware (middleware.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const protectedRoutes = ['/api/collections', '/api/mint', '/api/upload'];
const publicRoutes = ['/api/auth', '/api/health', '/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    );
  }
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    try {
      const identifier = request.ip || 'anonymous';
      const { success, limit, remaining, reset } = await rateLimit(identifier);
      
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());
      
      if (!success) {
        logger.warn('Rate limit exceeded', {
          ip: request.ip,
          pathname,
          userAgent: request.headers.get('user-agent'),
        });
        
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '900',
            },
          }
        );
      }
    } catch (error) {
      logger.error('Rate limiting error', { error, pathname });
    }
  }
  
  // Authentication check for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      
      if (!token) {
        logger.warn('Unauthorized access attempt', {
          ip: request.ip,
          pathname,
          userAgent: request.headers.get('user-agent'),
        });
        
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    } catch (error) {
      logger.error('Authentication error', { error, pathname });
      
      return new NextResponse(
        JSON.stringify({ error: 'Authentication failed' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Rate Limiting (lib/rate-limit.ts)
```typescript
import { Redis } from 'ioredis';
import { logger } from './logger';

const redis = new Redis(process.env.REDIS_URL!);

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const window = Math.floor(now / windowMs);
  const windowKey = `${key}:${window}`;
  
  try {
    const pipeline = redis.pipeline();
    pipeline.incr(windowKey);
    pipeline.expire(windowKey, Math.ceil(windowMs / 1000));
    
    const results = await pipeline.exec();
    const count = results?.[0]?.[1] as number || 0;
    
    const remaining = Math.max(0, limit - count);
    const reset = (window + 1) * windowMs;
    
    return {
      success: count <= limit,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    logger.error('Rate limiting error', { error, identifier });
    
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + windowMs,
    };
  }
}
```

## Database Optimization

### Database Migrations
```sql
-- Add indexes for performance
CREATE INDEX CONCURRENTLY idx_collections_user_id ON "Collection" ("userId");
CREATE INDEX CONCURRENTLY idx_collections_created_at ON "Collection" ("createdAt");
CREATE INDEX CONCURRENTLY idx_nft_metadata_collection_id ON "NftMetadata" ("collectionId");
CREATE INDEX CONCURRENTLY idx_mint_jobs_status ON "MintJob" ("status");
CREATE INDEX CONCURRENTLY idx_mint_jobs_created_at ON "MintJob" ("createdAt");
CREATE INDEX CONCURRENTLY idx_mint_jobs_user_id ON "MintJob" ("userId");

-- Add partial indexes for active jobs
CREATE INDEX CONCURRENTLY idx_mint_jobs_active 
ON "MintJob" ("id", "createdAt") 
WHERE "status" IN ('PENDING', 'PROCESSING');

-- Add composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_collections_user_status 
ON "Collection" ("userId", "status", "createdAt");

CREATE INDEX CONCURRENTLY idx_nft_metadata_collection_status 
ON "NftMetadata" ("collectionId", "status");
```

### Connection Pooling (lib/prisma.ts)
```typescript
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Log slow queries in production
if (process.env.NODE_ENV === 'production') {
  prisma.$on('query', (e) => {
    if (e.duration > 1000) { // Log queries taking more than 1 second
      logger.warn('Slow query detected', {
        query: e.query,
        duration: e.duration,
        params: e.params,
      });
    }
  });
}

prisma.$on('error', (e) => {
  logger.error('Prisma error', { error: e });
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
```

## Deployment Scripts

### Deploy Script (scripts/deploy.sh)
```bash
#!/bin/bash

set -e

echo "Starting deployment..."

# Build and push Docker image
echo "Building Docker image..."
docker build -t cnft-platform:latest .
docker tag cnft-platform:latest your-registry/cnft-platform:latest
docker push your-registry/cnft-platform:latest

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Update PM2 processes
echo "Updating PM2 processes..."
pm2 reload ecosystem.config.js --update-env

# Health check
echo "Performing health check..."
sleep 10
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)

if [ $response -eq 200 ]; then
  echo "Deployment successful! Health check passed."
else
  echo "Deployment failed! Health check returned: $response"
  exit 1
fi

echo "Deployment completed successfully!"
```

### Backup Script (scripts/backup.sh)
```bash
#!/bin/bash

set -e

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
DB_NAME="cnft_platform"

echo "Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Backing up database..."
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Redis backup
echo "Backing up Redis..."
redis-cli --rdb $BACKUP_DIR/redis_backup_$DATE.rdb

# Application logs backup
echo "Backing up logs..."
tar -czf $BACKUP_DIR/logs_backup_$DATE.tar.gz /var/log/cnft-platform/

# Clean old backups (keep last 7 days)
echo "Cleaning old backups..."
find $BACKUP_DIR -name "*backup*" -mtime +7 -delete

echo "Backup completed successfully!"
echo "Files created:"
ls -la $BACKUP_DIR/*$DATE*
```

## Monitoring Dashboard

### Metrics Collection (lib/metrics.ts)
```typescript
import { Redis } from 'ioredis';
import { logger } from './logger';
import { prisma } from './prisma';

const redis = new Redis(process.env.REDIS_URL!);

interface Metrics {
  timestamp: number;
  users: {
    total: number;
    active: number;
    new: number;
  };
  collections: {
    total: number;
    created_today: number;
  };
  nfts: {
    total: number;
    minted_today: number;
  };
  jobs: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  system: {
    memory_usage: NodeJS.MemoryUsage;
    uptime: number;
  };
}

export async function collectMetrics(): Promise<Metrics> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  try {
    const [users, collections, nfts, jobs] = await Promise.all([
      // User metrics
      prisma.user.aggregate({
        _count: { id: true },
      }),
      
      // Collection metrics
      Promise.all([
        prisma.collection.count(),
        prisma.collection.count({
          where: {
            createdAt: {
              gte: today,
            },
          },
        }),
      ]),
      
      // NFT metrics
      Promise.all([
        prisma.nftMetadata.count(),
        prisma.nftMetadata.count({
          where: {
            createdAt: {
              gte: today,
            },
          },
        }),
      ]),
      
      // Job metrics
      Promise.all([
        prisma.mintJob.count({ where: { status: 'PENDING' } }),
        prisma.mintJob.count({ where: { status: 'PROCESSING' } }),
        prisma.mintJob.count({ where: { status: 'COMPLETED' } }),
        prisma.mintJob.count({ where: { status: 'FAILED' } }),
      ]),
    ]);
    
    const metrics: Metrics = {
      timestamp: Date.now(),
      users: {
        total: users._count.id,
        active: 0, // TODO: Implement active user tracking
        new: 0, // TODO: Implement new user tracking
      },
      collections: {
        total: collections[0],
        created_today: collections[1],
      },
      nfts: {
        total: nfts[0],
        minted_today: nfts[1],
      },
      jobs: {
        pending: jobs[0],
        processing: jobs[1],
        completed: jobs[2],
        failed: jobs[3],
      },
      system: {
        memory_usage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };
    
    // Store metrics in Redis for dashboard
    await redis.setex(
      'metrics:current',
      300, // 5 minutes TTL
      JSON.stringify(metrics)
    );
    
    // Store historical metrics
    await redis.zadd(
      'metrics:history',
      Date.now(),
      JSON.stringify(metrics)
    );
    
    // Keep only last 24 hours of metrics
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    await redis.zremrangebyscore('metrics:history', 0, oneDayAgo);
    
    return metrics;
  } catch (error) {
    logger.error('Failed to collect metrics', { error });
    throw error;
  }
}

// Metrics API endpoint
export async function getMetrics(): Promise<Metrics | null> {
  try {
    const cached = await redis.get('metrics:current');
    if (cached) {
      return JSON.parse(cached);
    }
    
    return await collectMetrics();
  } catch (error) {
    logger.error('Failed to get metrics', { error });
    return null;
  }
}

export async function getHistoricalMetrics(hours: number = 24): Promise<Metrics[]> {
  try {
    const since = Date.now() - (hours * 60 * 60 * 1000);
    const results = await redis.zrangebyscore(
      'metrics:history',
      since,
      '+inf'
    );
    
    return results.map(result => JSON.parse(result));
  } catch (error) {
    logger.error('Failed to get historical metrics', { error });
    return [];
  }
}
```

## Next Steps
1. Set up production infrastructure (AWS/GCP/Azure)
2. Configure CI/CD pipeline (GitHub Actions/GitLab CI)
3. Set up monitoring and alerting (Datadog/New Relic)
4. Implement backup and disaster recovery
5. Configure SSL certificates and domain
6. Set up CDN for static assets
7. Implement log aggregation (ELK Stack)
8. Configure auto-scaling policies
9. Set up database read replicas
10. Implement comprehensive testing in production

## Key Production Features
- **Docker Containerization**: Multi-stage builds for optimized images
- **Process Management**: PM2 for clustering and process monitoring
- **Health Checks**: Comprehensive health monitoring for all services
- **Security**: Rate limiting, CSRF protection, security headers
- **Monitoring**: Structured logging, metrics collection, error tracking
- **Database Optimization**: Connection pooling, indexing, query monitoring
- **Backup & Recovery**: Automated backups for database and Redis
- **Graceful Shutdown**: Proper cleanup of resources and connections
- **Performance**: Caching, compression, and optimization strategies
- **Scalability**: Horizontal scaling with load balancing