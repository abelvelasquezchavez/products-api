import { Router } from 'express';
import { productController } from '../controllers/productController';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createProductSchema,
  listProductsSchema,
  productIdSchema,
  updateProductSchema,
} from '../schemas/productSchema';

const router = Router();

// Public reads.
router.get('/', validate(listProductsSchema), productController.list);
router.get('/:id', validate(productIdSchema), productController.getById);

// Protected writes.
router.post('/', requireAuth, validate(createProductSchema), productController.create);
router.put('/:id', requireAuth, validate(updateProductSchema), productController.update);
router.delete('/:id', requireAuth, validate(productIdSchema), productController.remove);

export default router;
