import { Request, Response, NextFunction } from 'express';
import { FamilyService } from '../services/family.service';

export class FamilyController {
  static getFamily(req: Request, res: Response, next: NextFunction) {
    try {
      const idParam = req.params.id as string;
      const familyId = idParam ? parseInt(idParam, 10) : 1;
      const data = FamilyService.getFamily(familyId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static createFamily(req: Request, res: Response, next: NextFunction) {
    try {
      const data = FamilyService.createFamily(req.body.name);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  static addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = FamilyService.addMember(req.body);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  }

  static updateMember(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = parseInt(req.params.memberId as string, 10);
      const member = FamilyService.updateMember(memberId, req.body);
      res.json(member);
    } catch (error) {
      next(error);
    }
  }

  static deleteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = parseInt(req.params.memberId as string, 10);
      const result = FamilyService.deleteMember(memberId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
