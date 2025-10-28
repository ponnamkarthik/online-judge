import { Router } from 'express';

import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, maybeAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import {
  createProblemHandler,
  deleteProblemHandler,
  getProblemHandler,
  listProblemsHandler,
  updateProblemHandler,
  createProblemSchema,
  updateProblemSchema,
} from '../controllers/problem.controller';

const router = Router();

// Public list and read
router.get('/', asyncHandler(listProblemsHandler));
router.get('/:pid(\\d+)', maybeAuth, asyncHandler(getProblemHandler));

// Protected create/update/delete - requires manage_problems permission
router.post(
  '/',
  requireAuth,
  authorize(['manage_problems']),
  validate(createProblemSchema),
  asyncHandler(createProblemHandler)
);
router.patch(
  '/:pid(\\d+)',
  requireAuth,
  authorize(['manage_problems']),
  validate(updateProblemSchema),
  asyncHandler(updateProblemHandler)
);
router.delete(
  '/:pid(\\d+)',
  requireAuth,
  authorize(['manage_problems']),
  asyncHandler(deleteProblemHandler)
);

export default router;
