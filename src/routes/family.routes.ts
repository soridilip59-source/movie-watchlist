import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import { validateBody } from '../middleware/validate';
import { createFamilySchema, createMemberSchema, updateMemberSchema } from '../schemas/family.schema';

const router = Router();

router.get('/family/:id?', FamilyController.getFamily);
router.post('/family', validateBody(createFamilySchema), FamilyController.createFamily);

router.post('/members', validateBody(createMemberSchema), FamilyController.addMember);
router.put('/members/:memberId', validateBody(updateMemberSchema), FamilyController.updateMember);
router.delete('/members/:memberId', FamilyController.deleteMember);

export default router;
