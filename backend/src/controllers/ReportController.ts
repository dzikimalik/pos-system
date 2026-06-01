import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/ReportService.js';
import { sendSuccess } from '../utils/response.js';

const reportService = new ReportService();

export class ReportController {
  async getDailySales(req: Request, res: Response, next: NextFunction) {
    try {
      const date = String(req.query.date || new Date().toISOString().split('T')[0]);
      const report = await reportService.getDailySales(date);
      sendSuccess(res, report, 'Daily sales report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getWeeklySales(req: Request, res: Response, next: NextFunction) {
    try {
      const endDate = String(req.query.endDate || new Date().toISOString().split('T')[0]);
      const startDate = String(req.query.startDate || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
      const report = await reportService.getWeeklySales(startDate, endDate);
      sendSuccess(res, report, 'Weekly sales report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMonthlySales(req: Request, res: Response, next: NextFunction) {
    try {
      const year = parseInt(String(req.query.year || String(new Date().getFullYear())), 10);
      const month = parseInt(String(req.query.month || String(new Date().getMonth() + 1)), 10);
      const report = await reportService.getMonthlySales(year, month);
      sendSuccess(res, report, 'Monthly sales report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProductSales(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId ? String(req.params.productId) : (req.query.productId ? String(req.query.productId) : undefined);
      const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
      const endDate = req.query.endDate ? String(req.query.endDate) : undefined;

      if (!productId) {
        res.status(400).json({ success: false, message: 'Product ID is required' });
        return;
      }

      const report = await reportService.getProductSales(productId, startDate, endDate);
      sendSuccess(res, report, 'Product sales report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const type = String(req.query.type || '');
      if (!type) {
        res.status(400).json({ success: false, message: 'Export type is required' });
        return;
      }

      const csv = await reportService.exportCSV(type, req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const type = String(req.query.type || '');
      if (!type) {
        res.status(400).json({ success: false, message: 'Export type is required' });
        return;
      }

      const result = await reportService.exportExcel(type, req.query);
      sendSuccess(res, result, 'Export data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
