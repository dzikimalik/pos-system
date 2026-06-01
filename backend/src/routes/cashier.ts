import { Router } from 'express';
import { CashierController } from '../controllers/CashierController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTransactionSchema } from '../validators/transaction.js';

const router = Router();
const cashierController = new CashierController();

router.use(authenticate);

router.post('/transaction', validate(createTransactionSchema), cashierController.processTransaction.bind(cashierController));

export default router;
