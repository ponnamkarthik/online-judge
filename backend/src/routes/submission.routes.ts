import { Router } from 'express';

import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import {
  getMyLastCodeHandler,
  getMyLastCodeSchema,
  listMySubmissionsHandler,
  listMySubmissionsSchema,
} from '../controllers/submission.controller';

const router = Router();

// Get my last code for a problem (optional language filter)
router.get(
  '/my/last',
  requireAuth,
  authorize(['submit_code']),
  validate(getMyLastCodeSchema, 'query'),
  asyncHandler(getMyLastCodeHandler)
);

// List my submissions
router.get(
  '/my',
  requireAuth,
  authorize(['submit_code']),
  validate(listMySubmissionsSchema, 'query'),
  asyncHandler(listMySubmissionsHandler)
);

export default router;
