import { Router } from 'express';

import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, maybeAuth } from '../middleware/auth';
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

// Protected create/update/delete (adjust auth as needed)
router.post('/', requireAuth, validate(createProblemSchema), asyncHandler(createProblemHandler));
router.patch(
  '/:pid(\\d+)',
  requireAuth,
  validate(updateProblemSchema),
  asyncHandler(updateProblemHandler)
);
router.delete('/:pid(\\d+)', requireAuth, asyncHandler(deleteProblemHandler));

export default router;
