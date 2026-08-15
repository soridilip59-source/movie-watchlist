import { Request, Response, NextFunction } from 'express';
import { RatingService } from '../services/rating.service';

export class RatingController {
  static getMovieRatings(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId = parseInt(req.params.movieId as string, 10);
      const data = RatingService.getMovieRatings(movieId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static addOrUpdateRating(req: Request, res: Response, next: NextFunction) {
    try {
      const data = RatingService.addOrUpdateRating(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static deleteRating(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId = parseInt(req.params.movieId as string, 10);
      const memberId = parseInt(req.params.memberId as string, 10);
      const result = RatingService.deleteRating(movieId, memberId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
