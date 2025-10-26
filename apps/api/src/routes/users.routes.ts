import { Router } from 'express';

import { deleteUser, getUserById, getUsers, updateUser } from '@controllers/users.controller';
import authorizeRoles from '@middleware/authorizeRoles';
import verifyToken from '@middleware/verifyToken';
import { Role } from '@prisma/client';

const router = Router();

router.use(verifyToken);

router.get('/', authorizeRoles(Role.ADMIN), getUsers);
router.get('/:id', getUserById);
router.patch('/:id', authorizeRoles(Role.ADMIN), updateUser);
router.delete('/:id', authorizeRoles(Role.ADMIN), deleteUser);

export default router;
