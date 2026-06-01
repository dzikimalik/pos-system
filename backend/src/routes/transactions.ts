import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const transactionController = new TransactionController();

router.use(authenticate);

router.get('/', transactionController.getAll.bind(transactionController));
router.get('/invoice/:invoiceNumber', transactionController.getByInvoiceNumber.bind(transactionController));
router.get('/:id', transactionController.getById.bind(transactionController));
router.post('/:id/refund', authorize('ADMIN'), transactionController.refund.bind(transactionController));

export default router;
