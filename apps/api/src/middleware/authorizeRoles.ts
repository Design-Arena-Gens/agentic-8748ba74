import { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

export const authorizeRoles = (...allowed: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (req.user.role === Role.SUPER_ADMIN) {
      next();
      return;
    }

    if (!allowed.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    next();
  };
};

export default authorizeRoles;
