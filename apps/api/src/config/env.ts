import path from 'path';

import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/edubloom?schema=public',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY ?? '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY ?? '7d',
  aiServiceUrl: process.env.AI_SERVICE_URL ?? 'http://localhost:8000',
  clientOrigin: process.env.CLIENT_ORIGIN ?? '*',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 100)
};

export default env;
