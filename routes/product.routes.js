import { Router } from 'express';
import Product from '../models/Product.js';
import { crud } from '../controllers/crud.controller.js';
import { auth } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { productSchema, productUpdateSchema } from '../validators/index.js';

const c = crud(Product);
export default Router()
  .use(auth()) // every product route requires login
  .get('/', c.getAll)
  .post('/', upload('image', productSchema), c.create)
  .get('/:id', c.getOne)
  .put('/:id', upload('image', productUpdateSchema), c.update)
  .delete('/:id', c.remove);
