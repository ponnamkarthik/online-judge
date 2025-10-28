import { Router } from 'express';

import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { asyncHandler } from '../utils/asyncHandler';
import { aiReviewHandler, aiReviewSchema } from '../controllers/ai.controller';

const router = Router();

// AI review - requires submit_code permission
router.post(
  '/review',
  requireAuth,
  authorize(['submit_code']),
  validate(aiReviewSchema),
  asyncHandler(aiReviewHandler)
);

export default router;
