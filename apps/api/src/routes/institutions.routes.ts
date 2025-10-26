import { Router } from 'express';

import {
  createInstitution,
  deleteInstitution,
  listInstitutions,
  updateInstitution
} from '@controllers/institutions.controller';
import authorizeRoles from '@middleware/authorizeRoles';
import verifyToken from '@middleware/verifyToken';
import { Role } from '@prisma/client';

const router = Router();

router.use(verifyToken, authorizeRoles(Role.SUPER_ADMIN));

router.get('/', listInstitutions);
router.post('/', createInstitution);
router.patch('/:id', updateInstitution);
router.delete('/:id', deleteInstitution);

export default router;
