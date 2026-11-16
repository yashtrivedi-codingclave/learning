import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { register, login, me } from '../controllers/auth.controller.js';
import { auth } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validators/index.js';

// Max 5 failed logins per IP per 15 minutes; successful logins don't count
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { message: 'Too many failed login attempts. Try again in 15 minutes' },
});

export default Router()
  .post('/register', upload('dp', registerSchema), register)
  .post('/login', loginLimit, validate(loginSchema), login)
  .get('/me', auth(), me);
