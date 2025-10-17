import { Router } from 'express';

import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { aiReviewHandler, aiReviewSchema } from '../controllers/ai.controller';

const router = Router();

router.post('/review', requireAuth, validate(aiReviewSchema), asyncHandler(aiReviewHandler));

export default router;
