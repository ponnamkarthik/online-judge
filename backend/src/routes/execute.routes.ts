import { Router } from 'express';

import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { Submission } from '../models/submission.model';
import {
  executeTestHandler,
  executeSubmitHandler,
  executeTestSchema,
  executeSubmitSchema,
} from '../controllers/execute.controller';

const router = Router();

router.post('/test', validate(executeTestSchema), asyncHandler(executeTestHandler));
router.post(
  '/submit',
  requireAuth,
  validate(executeSubmitSchema),
  asyncHandler(executeSubmitHandler)
);

// List current user's submissions (basic pagination optional via query params in future)
router.get(
  '/my',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user?.id;
    const docs = await Submission.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-code'); // omit code by default to reduce payload; can add ?includeCode=1 later
    res.json({ submissions: docs });
  })
);

export default router;
