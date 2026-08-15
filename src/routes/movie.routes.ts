import { Router } from 'express';
import { MovieController } from '../controllers/movie.controller';
import { validateBody, validateQuery } from '../middleware/validate';
import { createMovieSchema, updateMovieSchema, queryMovieSchema } from '../schemas/movie.schema';

const router = Router();

router.get('/movies', validateQuery(queryMovieSchema), MovieController.getMovies);
router.get('/movies/:id', MovieController.getMovieById);
router.post('/movies', validateBody(createMovieSchema), MovieController.createMovie);
router.put('/movies/:id', validateBody(updateMovieSchema), MovieController.updateMovie);
router.delete('/movies/:id', MovieController.deleteMovie);

export default router;
