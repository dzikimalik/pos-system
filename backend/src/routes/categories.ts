import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.js';

const router = Router();
const categoryController = new CategoryController();

router.use(authenticate);

router.get('/', categoryController.getAll.bind(categoryController));
router.get('/:id', categoryController.getById.bind(categoryController));
router.post('/', authorize('ADMIN'), validate(createCategorySchema), categoryController.create.bind(categoryController));
router.put('/:id', authorize('ADMIN'), validate(updateCategorySchema), categoryController.update.bind(categoryController));
router.delete('/:id', authorize('ADMIN'), categoryController.delete.bind(categoryController));

export default router;
