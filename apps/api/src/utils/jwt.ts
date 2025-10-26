import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';

import env from '@config/env';

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: Role;
  jti?: string;
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
}

export const generateTokenId = (): string => crypto.randomUUID();

export const signAccessToken = (params: { id: string; email: string; role: Role; tokenId?: string }): string => {
  const payload: JwtAccessPayload = {
    sub: params.id,
    email: params.email,
    role: params.role,
    jti: params.tokenId
  };

  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpiry as SignOptions['expiresIn']
  });
};

export const signRefreshToken = (params: { id: string; tokenId: string }): string => {
  const payload: JwtRefreshPayload = {
    sub: params.id,
    tokenId: params.tokenId
  };

  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpiry as SignOptions['expiresIn']
  });
};

export const verifyAccessToken = (token: string): JwtAccessPayload => {
  return jwt.verify(token, env.jwtAccessSecret) as JwtAccessPayload;
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtRefreshPayload;
};
