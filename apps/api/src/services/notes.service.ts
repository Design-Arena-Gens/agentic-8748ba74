import prisma from '@db/client';

interface CreateNoteParams {
  studentId: string;
  authorId?: string;
  content: string;
}

export const createNoteForStudent = async ({ studentId, authorId, content }: CreateNoteParams) => {
  return prisma.note.create({
    data: {
      studentId,
      authorId,
      content
    },
    select: {
      id: true,
      studentId: true,
      authorId: true,
      content: true,
      createdAt: true
    }
  });
};

export const getNotesForStudent = async (studentId: string) => {
  return prisma.note.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      studentId: true,
      authorId: true,
      createdAt: true
    }
  });
};
