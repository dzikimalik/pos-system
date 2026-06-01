import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

router.get('/stats', dashboardController.getStats.bind(dashboardController));
router.get('/best-selling', dashboardController.getBestSellingProducts.bind(dashboardController));
router.get('/recent-transactions', dashboardController.getRecentTransactions.bind(dashboardController));

export default router;
