import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = AuthService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
