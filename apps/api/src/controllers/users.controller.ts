import { Role } from '@prisma/client';
import { z } from 'zod';
import type { Request, Response } from 'express';

import prisma from '@db/client';
import { hashPassword } from '@utils/password';

export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      institutionId: true,
      createdAt: true
    }
  });

  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (req.user.role !== Role.ADMIN && req.user.role !== Role.SUPER_ADMIN && req.user.id !== id) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      institutionId: true,
      createdAt: true
    }
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json(user);
};

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.nativeEnum(Role).optional(),
  password: z.string().min(8).optional()
});

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = updateSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.role) data.role = body.role;
  if (body.password) {
    data.password = await hashPassword(body.password);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      institutionId: true,
      updatedAt: true
    }
  });

  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  await prisma.user.delete({ where: { id } });

  res.status(204).send();
};
