import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlist.controller';
import { validateBody, validateQuery } from '../middleware/validate';
import { addToWatchlistSchema, updateWatchlistSchema, queryWatchlistSchema } from '../schemas/watchlist.schema';

const router = Router();

router.get('/watchlist', validateQuery(queryWatchlistSchema), WatchlistController.getWatchlist);
router.post('/watchlist', validateBody(addToWatchlistSchema), WatchlistController.addToWatchlist);
router.patch('/watchlist/:id', validateBody(updateWatchlistSchema), WatchlistController.updateWatchlistItem);
router.delete('/watchlist/:id', WatchlistController.removeFromWatchlist);

export default router;
