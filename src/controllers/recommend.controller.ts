import { Request, Response, NextFunction } from 'express';
import { RecommendService } from '../services/recommend.service';

export class RecommendController {
  static getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const data = RecommendService.getRecommendations(req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}
