import { AlertSeverity } from '@prisma/client';
import type { Request, Response } from 'express';
import { z } from 'zod';

import prisma from '@db/client';
import { getRealtimeNamespace } from '@services/socket';

const alertCreateSchema = z.object({
  message: z.string().min(1),
  severity: z.nativeEnum(AlertSeverity),
  studentId: z.string().uuid()
});

export const listAlerts = async (req: Request, res: Response) => {
  const { studentId } = req.query as { studentId?: string };

  const alerts = await prisma.alert.findMany({
    where: {
      studentId: studentId ?? undefined
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      message: true,
      severity: true,
      studentId: true,
      createdById: true,
      read: true,
      createdAt: true
    }
  });

  res.json(alerts);
};

export const createAlert = async (req: Request, res: Response) => {
  const payload = alertCreateSchema.parse(req.body);

  const student = await prisma.student.findUnique({ where: { id: payload.studentId } });
  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  const alert = await prisma.alert.create({
    data: {
      message: payload.message,
      severity: payload.severity,
      studentId: payload.studentId,
      createdById: req.user?.id
    },
    select: {
      id: true,
      message: true,
      severity: true,
      studentId: true,
      createdById: true,
      read: true,
      createdAt: true
    }
  });

  try {
    const realtime = getRealtimeNamespace();
    realtime.emit('alert:new', alert);
  } catch (error) {
    // socket server might not be initialised during tests
  }

  res.status(201).json(alert);
};

export const markAlertRead = async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.alert.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: 'Alert not found' });
    return;
  }

  const alert = await prisma.alert.update({
    where: { id },
    data: { read: true },
    select: {
      id: true,
      message: true,
      severity: true,
      studentId: true,
      read: true,
      updatedAt: true
    }
  });

  res.json(alert);
};
