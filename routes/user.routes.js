import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { auth } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { userSchema, userUpdateSchema } from '../validators/index.js';

const router = Router();

router.use(auth('admin')); // user management is admin only

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', upload('dp', userSchema), createUser);
router.put('/:id', upload('dp', userUpdateSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
