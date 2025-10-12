import { Router } from 'express';

import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import {
  executeTestHandler,
  executeSubmitHandler,
  executeTestSchema,
  executeSubmitSchema,
} from '../controllers/execute.controller';

const router = Router();

router.post('/test', validate(executeTestSchema), asyncHandler(executeTestHandler));
router.post('/submit', validate(executeSubmitSchema), asyncHandler(executeSubmitHandler));

export default router;
