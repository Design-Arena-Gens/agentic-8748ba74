import { Router } from 'express';

import { createAlert, listAlerts, markAlertRead } from '@controllers/alerts.controller';
import authorizeRoles from '@middleware/authorizeRoles';
import verifyToken from '@middleware/verifyToken';
import { Role } from '@prisma/client';

const router = Router();

router.use(verifyToken);

router.get('/', listAlerts);
router.post('/', authorizeRoles(Role.ADMIN, Role.FACULTY), createAlert);
router.patch('/:id/read', markAlertRead);

export default router;
