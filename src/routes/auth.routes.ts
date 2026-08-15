import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { signupSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/auth/signup', validateBody(signupSchema), AuthController.signup);
router.post('/auth/login', validateBody(loginSchema), AuthController.login);

export default router;
