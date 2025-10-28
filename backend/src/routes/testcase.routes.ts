import { Router } from 'express';

import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import {
  bulkCreateTestcasesHandler,
  bulkCreateTestcasesSchema,
  getTestcasesByProblemHandler,
  createTestcaseHandler,
  createTestcaseSchema,
  updateTestcaseHandler,
  updateTestcaseSchema,
  deleteTestcaseHandler,
} from '../controllers/testcase.controller';

const router = Router();

// Get all test cases for a problem - requires manage_testcases permission
router.get(
  '/problem/:pid(\\d+)',
  requireAuth,
  authorize(['manage_testcases']),
  asyncHandler(getTestcasesByProblemHandler)
);

// Create a single test case for a problem - requires manage_testcases permission
router.post(
  '/problem/:pid(\\d+)',
  requireAuth,
  authorize(['manage_testcases']),
  validate(createTestcaseSchema),
  asyncHandler(createTestcaseHandler)
);

// Update a test case - requires manage_testcases permission
router.patch(
  '/:id',
  requireAuth,
  authorize(['manage_testcases']),
  validate(updateTestcaseSchema),
  asyncHandler(updateTestcaseHandler)
);

// Delete a test case - requires manage_testcases permission
router.delete(
  '/:id',
  requireAuth,
  authorize(['manage_testcases']),
  asyncHandler(deleteTestcaseHandler)
);

// Bulk create test cases - requires manage_testcases permission
router.post(
  '/bulk',
  requireAuth,
  authorize(['manage_testcases']),
  validate(bulkCreateTestcasesSchema),
  asyncHandler(bulkCreateTestcasesHandler)
);

export default router;
