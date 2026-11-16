import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { protect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { createProductSchema, updateProductSchema } from '../validators/index.js';

const router = Router();

// Every route below: must be logged in
router.use(protect);

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', upload.single('image'), validate(createProductSchema), createProduct);
router.put('/:id', upload.single('image'), validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
