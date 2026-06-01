import { Router } from 'express';
import { ReportController } from '../controllers/ReportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const reportController = new ReportController();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/daily', reportController.getDailySales.bind(reportController));
router.get('/weekly', reportController.getWeeklySales.bind(reportController));
router.get('/monthly', reportController.getMonthlySales.bind(reportController));
router.get('/products', reportController.getProductSales.bind(reportController));
router.get('/products/:productId', reportController.getProductSales.bind(reportController));
router.get('/export/csv', reportController.exportCSV.bind(reportController));
router.get('/export/excel', reportController.exportExcel.bind(reportController));

export default router;
