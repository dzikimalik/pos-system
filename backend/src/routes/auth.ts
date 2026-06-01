import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.js';

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));

export default router;
