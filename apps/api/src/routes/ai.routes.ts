import { Router } from 'express';
import multer from 'multer';

import { explainRisk, predictRisk, retrainModel } from '@controllers/ai.controller';
import authorizeRoles from '@middleware/authorizeRoles';
import verifyToken from '@middleware/verifyToken';
import { Role } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(verifyToken);

router.post('/predict', predictRisk);
router.post('/explain', explainRisk);
router.post('/retrain', authorizeRoles(Role.ADMIN), upload.single('file'), retrainModel);

export default router;
