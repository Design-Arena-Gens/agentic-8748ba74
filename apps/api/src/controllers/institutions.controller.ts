import { z } from 'zod';
import type { Request, Response } from 'express';

import prisma from '@db/client';

const createSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  studentCount: z.number().int().nonnegative().optional()
});

const updateSchema = createSchema.partial();

export const listInstitutions = async (_req: Request, res: Response) => {
  const institutions = await prisma.institution.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      location: true,
      studentCount: true,
      createdAt: true
    }
  });

  res.json(institutions);
};

export const createInstitution = async (req: Request, res: Response) => {
  const payload = createSchema.parse(req.body);

  const institution = await prisma.institution.create({
    data: payload,
    select: {
      id: true,
      name: true,
      location: true,
      studentCount: true,
      createdAt: true
    }
  });

  res.status(201).json(institution);
};

export const updateInstitution = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = updateSchema.parse(req.body);

  const institution = await prisma.institution.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      name: true,
      location: true,
      studentCount: true,
      updatedAt: true
    }
  });

  res.json(institution);
};

export const deleteInstitution = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.institution.delete({ where: { id } });

  res.status(204).send();
};
