import { Router } from 'express';

import { login, logout, refresh, register } from '@controllers/auth.controller';
import authorizeRoles from '@middleware/authorizeRoles';
import verifyToken from '@middleware/verifyToken';
import { Role } from '@prisma/client';

const router = Router();

router.post('/register', verifyToken, authorizeRoles(Role.ADMIN, Role.SUPER_ADMIN), register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);

export default router;
