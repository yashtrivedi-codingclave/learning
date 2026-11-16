import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { createUserSchema, updateUserSchema } from '../validators/index.js';

const router = Router();

// Every route below: must be logged in AND must be an admin
router.use(protect, adminOnly);

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', upload.single('dp'), validate(createUserSchema), createUser);
router.put('/:id', upload.single('dp'), validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
