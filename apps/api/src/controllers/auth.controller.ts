import { Role } from '@prisma/client';
import ms from 'ms';
import type { StringValue } from 'ms';
import type { Request, Response } from 'express';
import { z } from 'zod';

import env from '@config/env';
import prisma from '@db/client';
import {
  generateTokenId,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '@utils/jwt';
import { hashPassword, hashToken, verifyPassword, verifyTokenHash } from '@utils/password';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
  institutionId: z.string().uuid().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const defaultRefreshMaxAge = ms('7d');
const refreshTokenMaxAge = ms(env.refreshTokenExpiry as StringValue) ?? defaultRefreshMaxAge;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: refreshTokenMaxAge
};

export const register = async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }

  const passwordHash = await hashPassword(body.password);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: passwordHash,
      role: body.role,
      institutionId: body.institutionId
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      institutionId: true,
      createdAt: true
    }
  });

  res.status(201).json(user);
};

const buildAuthResponse = async (userId: string, email: string, role: Role, res: Response) => {
  const tokenId = generateTokenId();
  const accessToken = signAccessToken({ id: userId, email, role, tokenId });
  const refreshToken = signRefreshToken({ id: userId, tokenId });
  const refreshExpiryMs = ms(env.refreshTokenExpiry as StringValue) ?? defaultRefreshMaxAge;

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenId,
      tokenHash: await hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshExpiryMs)
    }
  });

  res.cookie('refreshToken', refreshToken, cookieOptions);

  return { accessToken };
};

export const login = async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const isValid = await verifyPassword(user.password, body.password);
  if (!isValid) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const { accessToken } = await buildAuthResponse(user.id, user.email, user.role, res);

  res.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  });
};

const extractRefreshToken = (req: Request): string | null => {
  if (req.cookies?.refreshToken) {
    return req.cookies.refreshToken;
  }

  if (typeof req.body?.refreshToken === 'string') {
    return req.body.refreshToken;
  }

  if (typeof req.headers['x-refresh-token'] === 'string') {
    return req.headers['x-refresh-token'];
  }

  return null;
};

export const refresh = async (req: Request, res: Response) => {
  const token = extractRefreshToken(req);

  if (!token) {
    res.status(401).json({ message: 'Refresh token missing' });
    return;
  }

  try {
    const payload = verifyRefreshToken(token);
    const storedToken = await prisma.refreshToken.findUnique({ where: { tokenId: payload.tokenId } });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      res.status(401).json({ message: 'Refresh token expired' });
      return;
    }

    const tokenMatches = await verifyTokenHash(storedToken.tokenHash, token);
    if (!tokenMatches) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      res.status(401).json({ message: 'Refresh token invalid' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: storedToken.userId } });
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const { accessToken } = await buildAuthResponse(user.id, user.email, user.role, res);

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Refresh token invalid or expired' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = extractRefreshToken(req);

  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await prisma.refreshToken.deleteMany({ where: { tokenId: payload.tokenId } });
    } catch (error) {
      // ignore invalid token on logout
    }
  }

  res.clearCookie('refreshToken', { path: '/' });
  res.json({ message: 'Logged out' });
};
