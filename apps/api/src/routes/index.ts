import { Router } from 'express';

import aiRoutes from './ai.routes';
import alertsRoutes from './alerts.routes';
import authRoutes from './auth.routes';
import institutionsRoutes from './institutions.routes';
import notesRoutes from './notes.routes';
import studentsRoutes from './students.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/students', studentsRoutes);
router.use('/alerts', alertsRoutes);
router.use('/notes', notesRoutes);
router.use('/institutions', institutionsRoutes);
router.use('/ai', aiRoutes);

export default router;
