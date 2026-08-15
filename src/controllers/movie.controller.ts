import { Request, Response, NextFunction } from 'express';
import { MovieService } from '../services/movie.service';

export class MovieController {
  static getMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const data = MovieService.getMovies(req.query as any);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static getMovieById(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId = parseInt(req.params.id as string, 10);
      const data = MovieService.getMovieById(movieId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static createMovie(req: Request, res: Response, next: NextFunction) {
    try {
      const data = MovieService.createMovie(req.body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  static updateMovie(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId = parseInt(req.params.id as string, 10);
      const data = MovieService.updateMovie(movieId, req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static deleteMovie(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId = parseInt(req.params.id as string, 10);
      const result = MovieService.deleteMovie(movieId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
