import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validators/index.js';

const router = Router();

// Max 5 wrong logins per IP in 15 minutes (correct logins are not counted)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { message: 'Too many failed login attempts. Try again in 15 minutes' },
});

// Order matters: read form-data (multer) -> check data (zod) -> controller
router.post('/register', upload.single('dp'), validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
