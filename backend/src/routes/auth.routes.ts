import { Router } from 'express';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import {
  registerHandler,
  loginHandler,
  meHandler,
  refreshHandler,
  logoutHandler,
  registerSchema,
  loginSchema,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(registerHandler));
router.post('/login', validate(loginSchema), asyncHandler(loginHandler));
router.get('/me', requireAuth, asyncHandler(meHandler));
router.post('/refresh', asyncHandler(refreshHandler));
router.post('/logout', asyncHandler(logoutHandler));

export default router;
