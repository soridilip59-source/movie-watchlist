import { Router } from 'express';
import { RatingController } from '../controllers/rating.controller';
import { validateBody } from '../middleware/validate';
import { createRatingSchema } from '../schemas/rating.schema';

const router = Router();

router.get('/ratings/movie/:movieId', RatingController.getMovieRatings);
router.post('/ratings', validateBody(createRatingSchema), RatingController.addOrUpdateRating);
router.delete('/ratings/movie/:movieId/member/:memberId', RatingController.deleteRating);

export default router;
