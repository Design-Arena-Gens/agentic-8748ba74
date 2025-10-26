import { Router } from 'express';
import multer from 'multer';

import {
  addStudentNote,
  getStudent,
  getStudentMetrics,
  importStudents,
  listStudentNotes,
  listStudents
} from '@controllers/students.controller';
import authorizeRoles from '@middleware/authorizeRoles';
import verifyToken from '@middleware/verifyToken';
import { Role } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(verifyToken);

router.get('/', authorizeRoles(Role.ADMIN, Role.FACULTY), listStudents);
router.post('/import', authorizeRoles(Role.ADMIN), upload.single('file'), importStudents);
router.get('/:id', getStudent);
router.get('/:id/metrics', getStudentMetrics);
router.post('/:id/notes', authorizeRoles(Role.ADMIN, Role.FACULTY, Role.GUARDIAN), addStudentNote);
router.get('/:id/notes', authorizeRoles(Role.ADMIN, Role.FACULTY, Role.GUARDIAN), listStudentNotes);

export default router;
