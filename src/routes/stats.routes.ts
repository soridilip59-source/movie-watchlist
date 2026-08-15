import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';

const router = Router();

router.get('/stats', StatsController.getFamilyStats);

export default router;
