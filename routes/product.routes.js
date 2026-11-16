import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { auth } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { productSchema, productUpdateSchema } from '../validators/index.js';

const router = Router();

router.use(auth()); // every product route requires login

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', upload('image', productSchema), createProduct);
router.put('/:id', upload('image', productUpdateSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
