import rateLimit from 'express-rate-limit';

import env from '@config/env';

export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
});

export default apiRateLimiter;
