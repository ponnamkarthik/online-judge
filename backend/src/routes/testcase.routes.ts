import { Router } from 'express';

import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import {
  bulkCreateTestcasesHandler,
  bulkCreateTestcasesSchema,
} from '../controllers/testcase.controller';

const router = Router();

router.post(
  '/bulk',
  requireAuth,
  validate(bulkCreateTestcasesSchema),
  asyncHandler(bulkCreateTestcasesHandler)
);

export default router;
