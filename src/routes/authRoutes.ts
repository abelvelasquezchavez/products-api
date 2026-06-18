import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../schemas/authSchema';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;
