import { Router } from 'express';

import { createNote, getStudentNotes } from '@controllers/notes.controller';
import authorizeRoles from '@middleware/authorizeRoles';
import verifyToken from '@middleware/verifyToken';
import { Role } from '@prisma/client';

const router = Router();

router.use(verifyToken);

router.post('/', authorizeRoles(Role.ADMIN, Role.FACULTY, Role.GUARDIAN), createNote);
router.get('/student/:id', getStudentNotes);

export default router;
