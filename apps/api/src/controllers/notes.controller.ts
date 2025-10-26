import { z } from 'zod';
import type { Request, Response } from 'express';

import prisma from '@db/client';
import { createNoteForStudent, getNotesForStudent } from '@services/notes.service';

const noteSchema = z.object({
  studentId: z.string().uuid(),
  content: z.string().min(1)
});

export const createNote = async (req: Request, res: Response) => {
  const { studentId, content } = noteSchema.parse(req.body);

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  const note = await createNoteForStudent({
    studentId,
    content,
    authorId: req.user?.id
  });

  res.status(201).json(note);
};

export const getStudentNotes = async (req: Request, res: Response) => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  const notes = await getNotesForStudent(id);
  res.json(notes);
};
