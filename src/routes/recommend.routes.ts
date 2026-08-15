import { Router } from 'express';
import { RecommendController } from '../controllers/recommend.controller';
import { validateBody } from '../middleware/validate';
import { recommendSchema } from '../schemas/recommend.schema';

const router = Router();

router.post('/recommend', validateBody(recommendSchema), RecommendController.getRecommendations);

export default router;
