/**
 * Job Routes
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createJobSearchSchema } from '../validators/jobValidator.js';
import { jobController } from '../controllers/jobController.js';

const router = Router();

router.post('/search', authenticate, validate(createJobSearchSchema), jobController.createSearch);
router.get('/:searchId/status', authenticate, jobController.getStatus);
router.get('/:searchId/results', authenticate, jobController.getResults);

export default router;
