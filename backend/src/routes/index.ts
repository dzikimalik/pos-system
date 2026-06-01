import { Router } from 'express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import customerRoutes from './customers.js';
import dashboardRoutes from './dashboard.js';
import cashierRoutes from './cashier.js';
import transactionRoutes from './transactions.js';
import reportRoutes from './reports.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/cashier', cashierRoutes);
router.use('/transactions', transactionRoutes);
router.use('/reports', reportRoutes);

export default router;
