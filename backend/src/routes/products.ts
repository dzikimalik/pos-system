import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../validators/product.js';

const router = Router();
const productController = new ProductController();

router.use(authenticate);

router.get('/', productController.getAll.bind(productController));
router.get('/search', productController.search.bind(productController));
router.get('/barcode/:barcode', productController.findByBarcode.bind(productController));
router.get('/:id', productController.getById.bind(productController));
router.post('/', authorize('ADMIN'), validate(createProductSchema), productController.create.bind(productController));
router.put('/:id', authorize('ADMIN'), validate(updateProductSchema), productController.update.bind(productController));
router.delete('/:id', authorize('ADMIN'), productController.delete.bind(productController));

export default router;
