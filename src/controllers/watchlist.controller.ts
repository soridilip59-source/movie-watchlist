import { Request, Response, NextFunction } from 'express';
import { WatchlistService } from '../services/watchlist.service';

export class WatchlistController {
  static getWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const data = WatchlistService.getWatchlist(req.query as any);
      res.json({
        total: data.length,
        items: data
      });
    } catch (error) {
      next(error);
    }
  }

  static addToWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const data = WatchlistService.addToWatchlist(req.body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  static updateWatchlistItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const data = WatchlistService.updateWatchlistItem(id, req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static removeFromWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = WatchlistService.removeFromWatchlist(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
