import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import {
  globalAnalyticsHandler,
  userAnalyticsHandler,
  problemAnalyticsHandler,
  leaderboardHandler,
} from '../controllers/analytics.controller';

const router = Router();

// Public analytics - no auth required
router.get('/global', asyncHandler(globalAnalyticsHandler));
router.get('/leaderboard', asyncHandler(leaderboardHandler));
router.get('/problem/:pid(\\d+)', asyncHandler(problemAnalyticsHandler));

// User-specific analytics - requires view_analytics permission
router.get('/me', requireAuth, authorize(['view_analytics']), asyncHandler(userAnalyticsHandler));

export default router;
