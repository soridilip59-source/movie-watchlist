import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/stats.service';

export class StatsController {
  static getFamilyStats(req: Request, res: Response, next: NextFunction) {
    try {
      const familyId = req.query.family_id ? parseInt(req.query.family_id as string, 10) : 1;
      const data = StatsService.getFamilyStats(familyId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}
