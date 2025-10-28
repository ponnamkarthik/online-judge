import { Router } from 'express';

import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import {
  executeTestHandler,
  executeSubmitHandler,
  executeTestSchema,
  executeSubmitSchema,
} from '../controllers/execute.controller';

const router = Router();

// Execute test - requires submit_code permission
router.post(
  '/test',
  requireAuth,
  authorize(['submit_code']),
  validate(executeTestSchema),
  asyncHandler(executeTestHandler)
);

// Execute submit - requires submit_code permission
router.post(
  '/submit',
  requireAuth,
  authorize(['submit_code']),
  validate(executeSubmitSchema),
  asyncHandler(executeSubmitHandler)
);

// Note: user submissions endpoints moved to /api/submissions

export default router;
