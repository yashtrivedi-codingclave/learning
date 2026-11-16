import { Router } from 'express';
import User from '../models/User.js';
import { crud } from '../controllers/crud.controller.js';
import { auth } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { userSchema, userUpdateSchema } from '../validators/index.js';

const c = crud(User, 'dp');
export default Router()
  .use(auth('admin')) // user management is admin only
  .get('/', c.getAll)
  .post('/', upload('dp', userSchema), c.create)
  .get('/:id', c.getOne)
  .put('/:id', upload('dp', userUpdateSchema), c.update)
  .delete('/:id', c.remove);
