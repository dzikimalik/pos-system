import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.js';

const router = Router();
const customerController = new CustomerController();

router.use(authenticate);

router.get('/', customerController.getAll.bind(customerController));
router.get('/search', customerController.search.bind(customerController));
router.get('/:id', customerController.getById.bind(customerController));
router.post('/', authorize('ADMIN'), validate(createCustomerSchema), customerController.create.bind(customerController));
router.put('/:id', authorize('ADMIN'), validate(updateCustomerSchema), customerController.update.bind(customerController));
router.delete('/:id', authorize('ADMIN'), customerController.delete.bind(customerController));

export default router;
