import { Role } from '@prisma/client';
import { z } from 'zod';
import type { Request, Response } from 'express';

import prisma from '@db/client';
import { createNoteForStudent, getNotesForStudent } from '@services/notes.service';
import { parseStudentsCsv } from '@utils/csv';

const studentCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  institutionId: z.string().uuid().optional()
});

const noteSchema = z.object({
  content: z.string().min(1)
});

export const listStudents = async (_req: Request, res: Response) => {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      institutionId: true,
      createdAt: true,
      metrics: {
        select: {
          gpa: true,
          attendance: true,
          assignmentsOnTime: true,
          quizAvg: true,
          lmsActivity: true
        }
      }
    }
  });

  res.json(students);
};

export const getStudent = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const allowedRoles: Role[] = [Role.ADMIN, Role.FACULTY, Role.GUARDIAN, Role.SUPER_ADMIN];
  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  const student = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      institutionId: true,
      guardianId: true,
      createdAt: true,
      metrics: {
        select: {
          gpa: true,
          attendance: true,
          assignmentsOnTime: true,
          quizAvg: true,
          lmsActivity: true
        }
      }
    }
  });

  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  res.json(student);
};

export const importStudents = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'CSV file is required' });
    return;
  }

  const rows = parseStudentsCsv(req.file.buffer);

  const parsedStudents = rows
    .map((row) => {
      try {
        return studentCreateSchema.parse(row);
      } catch (error) {
        return null;
      }
    })
    .filter((row): row is z.infer<typeof studentCreateSchema> => row !== null);

  if (parsedStudents.length === 0) {
    res.status(400).json({ message: 'No valid students found in CSV' });
    return;
  }

  const created = await prisma.$transaction(
    parsedStudents.map((student) =>
      prisma.student.create({
        data: {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          institutionId: student.institutionId
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          institutionId: true
        }
      })
    )
  );

  res.status(201).json({ count: created.length, students: created });
};

export const getStudentMetrics = async (req: Request, res: Response) => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  const metrics = await prisma.metric.findUnique({
    where: { studentId: id },
    select: {
      gpa: true,
      attendance: true,
      assignmentsOnTime: true,
      quizAvg: true,
      lmsActivity: true
    }
  });

  if (!metrics) {
    res.json({
      attendance: null,
      gpa: null,
      assignments_on_time: null,
      quiz_avg: null,
      lms_activity: null
    });
    return;
  }

  res.json({
    attendance: metrics.attendance,
    gpa: metrics.gpa,
    assignments_on_time: metrics.assignmentsOnTime,
    quiz_avg: metrics.quizAvg,
    lms_activity: metrics.lmsActivity
  });
};

export const addStudentNote = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = noteSchema.parse(req.body);

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  const note = await createNoteForStudent({
    studentId: id,
    content,
    authorId: req.user?.id
  });

  res.status(201).json(note);
};

export const listStudentNotes = async (req: Request, res: Response) => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  const notes = await getNotesForStudent(id);
  res.json(notes);
};
