import { Router } from 'express';
import authRoutes from './auth.routes';
import familyRoutes from './family.routes';
import movieRoutes from './movie.routes';
import watchlistRoutes from './watchlist.routes';
import ratingRoutes from './rating.routes';
import recommendRoutes from './recommend.routes';
import statsRoutes from './stats.routes';

const apiRouter = Router();

apiRouter.use('/', authRoutes);
apiRouter.use('/', familyRoutes);
apiRouter.use('/', movieRoutes);
apiRouter.use('/', watchlistRoutes);
apiRouter.use('/', ratingRoutes);
apiRouter.use('/', recommendRoutes);
apiRouter.use('/', statsRoutes);

export default apiRouter;
